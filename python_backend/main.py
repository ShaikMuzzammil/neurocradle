"""
NeuroCradle FastAPI Backend
Gesture classification, session analytics, Claude code review, WebSocket stream
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import anthropic
import json
import math
import os
import asyncio
import time
from datetime import datetime

app = FastAPI(title="NeuroCradle API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Types ──────────────────────────────────────────────────────────────────────

class Landmark(BaseModel):
    x: float
    y: float
    z: float

class GestureRequest(BaseModel):
    landmarks: list[Landmark]
    hand: Optional[str] = "right"

class SessionRequest(BaseModel):
    session_data: dict
    user_id: Optional[str] = None

class CodeReviewRequest(BaseModel):
    code: str
    language: Optional[str] = "python"

# ── Gesture Classifier ────────────────────────────────────────────────────────
# Prototype landmarks for each gesture (normalized coordinates)
# Each prototype is a simplified 21-point hand pose

def compute_angles(lms: list[dict]) -> list[float]:
    """Compute finger angles from landmarks."""
    finger_tips = [4, 8, 12, 16, 20]
    finger_mids = [3, 7, 11, 15, 19]
    finger_bases = [2, 6, 10, 14, 18]
    angles = []
    for tip, mid, base in zip(finger_tips, finger_mids, finger_bases):
        v1 = (lms[mid]["x"] - lms[base]["x"], lms[mid]["y"] - lms[base]["y"])
        v2 = (lms[tip]["x"] - lms[mid]["x"], lms[tip]["y"] - lms[mid]["y"])
        dot = v1[0]*v2[0] + v1[1]*v2[1]
        mag1 = math.sqrt(v1[0]**2 + v1[1]**2) + 1e-6
        mag2 = math.sqrt(v2[0]**2 + v2[1]**2) + 1e-6
        angle = math.acos(max(-1, min(1, dot / (mag1 * mag2))))
        angles.append(math.degrees(angle))
    return angles

def classify_gesture(landmarks: list[dict]) -> tuple[str, float]:
    """Classify hand gesture from 21 landmarks using angle-based heuristics."""
    if len(landmarks) < 21:
        return "unknown", 0.0

    lms = [{"x": l["x"], "y": l["y"], "z": l["z"]} for l in landmarks]
    angles = compute_angles(lms)
    wrist = lms[0]

    # Helper: is fingertip above its base (extended)?
    def is_extended(tip_idx: int, base_idx: int) -> bool:
        return lms[tip_idx]["y"] < lms[base_idx]["y"]

    thumb_ext = lms[4]["x"] > lms[3]["x"]  # thumb sideways
    index_ext = is_extended(8, 5)
    middle_ext = is_extended(12, 9)
    ring_ext = is_extended(16, 13)
    pinky_ext = is_extended(20, 17)

    extended_count = sum([index_ext, middle_ext, ring_ext, pinky_ext])

    # Pinch: thumb tip close to index tip
    pinch_dist = math.sqrt(
        (lms[4]["x"] - lms[8]["x"])**2 + (lms[4]["y"] - lms[8]["y"])**2
    )

    if pinch_dist < 0.06:
        return "pinch", 0.92

    if extended_count == 0 and not thumb_ext:
        return "fist", 0.95

    if index_ext and middle_ext and not ring_ext and not pinky_ext:
        return "peace", 0.93

    if extended_count >= 4:
        return "open_palm", 0.96

    if index_ext and not middle_ext and not ring_ext and not pinky_ext:
        return "pointing", 0.94

    # Partial gestures
    if extended_count == 1:
        return "pointing", 0.7

    if extended_count == 3:
        return "open_palm", 0.65

    return "unknown", 0.4


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "online", "service": "NeuroCradle API", "version": "1.0.0", "time": datetime.now().isoformat()}

@app.get("/health")
async def health():
    return {"status": "healthy", "components": {"classifier": "ok", "ws": "ok", "anthropic": bool(os.getenv("ANTHROPIC_API_KEY"))}}


@app.post("/gesture/classify")
async def classify(req: GestureRequest):
    lms_dicts = [{"x": l.x, "y": l.y, "z": l.z} for l in req.landmarks]
    gesture, confidence = classify_gesture(lms_dicts)
    return {
        "gesture": gesture,
        "confidence": confidence,
        "hand": req.hand,
        "timestamp": time.time(),
        "landmark_count": len(req.landmarks),
    }


@app.post("/analytics/session")
async def analyze_session(req: SessionRequest):
    data = req.session_data
    gestures = data.get("gestures", [])

    if not gestures:
        return {"summary": "No gesture data", "stats": {}}

    from collections import Counter
    counts = Counter(g.get("gesture","unknown") for g in gestures)
    total = len(gestures)

    return {
        "total_gestures": total,
        "gesture_distribution": {k: {"count": v, "pct": round(v/total*100, 1)} for k, v in counts.most_common()},
        "dominant_gesture": counts.most_common(1)[0][0] if counts else "unknown",
        "session_quality": "excellent" if total > 100 else "good" if total > 50 else "brief",
        "recommendations": [
            "Try the peace gesture for dual-stream processing patterns",
            "Open palm generates distribution patterns great for data pipelines",
        ] if total < 50 else [],
    }


@app.post("/tools/review-code")
async def review_code(req: CodeReviewRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Demo fallback
        return {
            "review": "## Code Review\n\n*Note: Set ANTHROPIC_API_KEY for live AI review.*\n\n### Observations\n\n**1. Structure looks reasonable**\n- Consider adding type hints\n- Use list comprehensions where possible\n\n### Style\n- Follow PEP 8 guidelines\n- Add docstrings to public functions",
            "language": req.language,
            "lines": len(req.code.splitlines()),
        }

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": f"""You are an expert code reviewer. Review this {req.language} code and provide:
1. Issues found (bugs, anti-patterns, security)
2. Performance suggestions
3. Readability improvements
4. A refactored version if significant changes are needed

Format using markdown with emoji indicators (🔴 critical, 🟡 warning, 🟢 good).

Code to review:
```{req.language}
{req.code}
```"""
        }]
    )
    return {
        "review": message.content[0].text,
        "language": req.language,
        "lines": len(req.code.splitlines()),
        "tokens_used": message.usage.output_tokens,
    }


# ── WebSocket ─────────────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws) if ws in self.active else None

    async def broadcast(self, data: dict):
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()


@app.websocket("/ws/gesture-stream")
async def gesture_ws(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            landmarks = data.get("landmarks", [])
            hand = data.get("hand", "right")

            if landmarks:
                gesture, confidence = classify_gesture(landmarks)
                await ws.send_json({
                    "gesture": gesture,
                    "confidence": confidence,
                    "hand": hand,
                    "timestamp": time.time(),
                    "landmark_count": len(landmarks),
                })
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        manager.disconnect(ws)
        print(f"WS error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
