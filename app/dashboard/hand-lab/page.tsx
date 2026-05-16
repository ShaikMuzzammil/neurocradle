'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import {
  Hand, Play, Square, Download, Zap, Activity,
  Camera, CameraOff, Settings2, ChevronDown,
} from 'lucide-react'

// Types
interface Landmark { x: number; y: number; z: number }
interface GestureResult { gesture: string; confidence: number; hand: 'left' | 'right' }

const GESTURE_COLORS: Record<string, string> = {
  fist: '#FF00FF',
  peace: '#00F5FF',
  open_palm: '#00FF88',
  pinch: '#FFE500',
  pointing: '#8B00FF',
  unknown: 'rgba(224,232,255,0.4)',
}

// Elastic string physics helper
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

export default function HandLabPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const animRef = useRef<number>()
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const landmarksRef = useRef<{ left: Landmark[] | null; right: Landmark[] | null }>({ left: null, right: null })
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; color: string; size: number
  }>>([])
  const prevTouchRef = useRef(false)
  const recordingRef = useRef(false)
  const frameCountRef = useRef(0)

  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gesture, setGesture] = useState<GestureResult | null>(null)
  const [fps, setFps] = useState(0)
  const [recording, setRecording] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    elasticStrings: true,
    particleExplosion: true,
    showLandmarks: true,
    crtEffect: true,
    stringThickness: 2,
    neonGlow: true,
  })

  // FPS tracking
  useEffect(() => {
    let lastTime = performance.now()
    let frames = 0
    const track = () => {
      frames++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setFps(frames)
        frames = 0
        lastTime = now
      }
      if (cameraActive) requestAnimationFrame(track)
    }
    if (cameraActive) requestAnimationFrame(track)
  }, [cameraActive])

  // Session timer
  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setSessionTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  // WebSocket for gesture classification
  const connectWS = useCallback(() => {
    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_API_WS_URL ?? 'ws://localhost:8000/ws/gesture-stream')
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.gesture) setGesture(data)
        } catch {}
      }
      ws.onerror = () => {}
      wsRef.current = ws
    } catch {}
  }, [])

  // Send landmarks to WS
  const sendLandmarks = useCallback((landmarks: Landmark[], hand: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ landmarks, hand }))
    }
  }, [])

  // Particle explosion
  const explodeParticles = useCallback((x: number, y: number, color: string) => {
    if (!settings.particleExplosion) return
    const count = 18
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 40 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 4,
      })
    }
  }, [settings.particleExplosion])

  // Draw everything on overlay canvas
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const { left, right } = landmarksRef.current

    // Helper: landmark to canvas coords (mirrored)
    const lc = (lm: Landmark) => ({
      x: (1 - lm.x) * W,
      y: lm.y * H,
    })

    // Draw hand skeleton
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],        // thumb
      [0,5],[5,6],[6,7],[7,8],        // index
      [0,9],[9,10],[10,11],[11,12],   // middle
      [0,13],[13,14],[14,15],[15,16], // ring
      [0,17],[17,18],[18,19],[19,20], // pinky
      [5,9],[9,13],[13,17],           // palm
    ]

    const drawHand = (landmarks: Landmark[], color: string) => {
      if (!settings.showLandmarks) return

      // Draw connections
      CONNECTIONS.forEach(([a, b]) => {
        const pa = lc(landmarks[a])
        const pb = lc(landmarks[b])
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.strokeStyle = `${color}80`
        ctx.lineWidth = 1.5
        if (settings.neonGlow) {
          ctx.shadowBlur = 6
          ctx.shadowColor = color
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      // Draw landmarks
      landmarks.forEach((lm, i) => {
        const p = lc(lm)
        const isTip = [4, 8, 12, 16, 20].includes(i)
        const r = isTip ? 5 : 3

        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = isTip ? color : `${color}CC`
        if (settings.neonGlow) {
          ctx.shadowBlur = isTip ? 12 : 6
          ctx.shadowColor = color
        }
        ctx.fill()
        ctx.shadowBlur = 0

        // Index label
        if (isTip) {
          ctx.font = '9px JetBrains Mono'
          ctx.fillStyle = `${color}80`
          ctx.fillText(String(i), p.x + 6, p.y - 4)
        }
      })
    }

    if (left) drawHand(left, '#00F5FF')
    if (right) drawHand(right, '#FF00FF')

    // ── ELASTIC STRINGS between fingertips ─────────────────────────────────
    if (settings.elasticStrings && left && right) {
      const leftTips = [4, 8, 12, 16, 20]
      const rightTips = [4, 8, 12, 16, 20]

      leftTips.forEach((li, idx) => {
        const ri = rightTips[idx]
        const p1 = lc(left[li])
        const p2 = lc(right[ri])

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 400
        const normalizedDist = Math.min(dist / maxDist, 1)

        // Dynamic color based on stretch
        const r = Math.floor(lerp(0, 255, normalizedDist))
        const g = Math.floor(lerp(245, 0, normalizedDist))
        const b = Math.floor(lerp(255, 255, normalizedDist))
        const stringColor = `rgb(${r},${g},${b})`

        // Dynamic thickness: thicker when closer
        const thickness = settings.stringThickness * (1 + (1 - normalizedDist) * 3)

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = stringColor
        ctx.lineWidth = thickness
        if (settings.neonGlow) {
          ctx.shadowBlur = 8 + (1 - normalizedDist) * 15
          ctx.shadowColor = stringColor
        }
        ctx.stroke()
        ctx.shadowBlur = 0

        // Detect fingertip collision
        if (dist < 40) {
          const midPx = (p1.x + p2.x) / 2
          const midPy = (p1.y + p2.y) / 2
          if (!prevTouchRef.current) {
            explodeParticles(midPx, midPy, '#FFE500')
            prevTouchRef.current = true
          }

          // Draw touch indicator
          ctx.beginPath()
          ctx.arc(midPx, midPy, 8 + (40 - dist) / 4, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255,229,0,0.6)'
          ctx.lineWidth = 2
          ctx.shadowBlur = 20
          ctx.shadowColor = '#FFE500'
          ctx.stroke()
          ctx.shadowBlur = 0
        } else {
          prevTouchRef.current = false
        }
      })
    }

    // ── PARTICLES ───────────────────────────────────────────────────────────
    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    particlesRef.current.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // gravity
      p.vx *= 0.97
      p.life -= 1 / p.maxLife

      const alpha = p.life
      const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0')

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fillStyle = p.color + hexAlpha
      if (settings.neonGlow) {
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
      }
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // FPS label
    frameCountRef.current++
  }, [settings, explodeParticles])

  // Init MediaPipe Hands
  const startCamera = useCallback(async () => {
    setLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Dynamically import MediaPipe
      const { Hands } = await import('@mediapipe/hands')
      const { Camera } = await import('@mediapipe/camera_utils')

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      })

      hands.onResults((results: any) => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video || !video.videoWidth) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        if (overlayRef.current) {
          overlayRef.current.width = video.videoWidth
          overlayRef.current.height = video.videoHeight
        }

        // Reset hands
        landmarksRef.current = { left: null, right: null }

        results.multiHandLandmarks?.forEach((landmarks: Landmark[], i: number) => {
          const handedness = results.multiHandedness?.[i]?.label?.toLowerCase() as 'left' | 'right'
          const correctedHand = handedness === 'left' ? 'right' : 'left' // mirrored
          landmarksRef.current[correctedHand] = landmarks
          sendLandmarks(landmarks, correctedHand)
        })

        drawOverlay()
      })

      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          try {
            if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
              await hands.send({ image: videoRef.current })
            }
          } catch (e) {
            // Ignore frame drops
          }
        },
        width: 1280,
        height: 720,
      })

      camera.start()
      handsRef.current = hands
      cameraRef.current = camera

      connectWS()
      setCameraActive(true)
    } catch (err) {
      console.error('Camera init failed:', err)
    } finally {
      setLoading(false)
    }
  }, [connectWS, sendLandmarks, drawOverlay])

  const stopCamera = useCallback(() => {
    cameraRef.current?.stop()
    wsRef.current?.close()
    const video = videoRef.current
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      video.srcObject = null
    }
    setCameraActive(false)
    setGesture(null)
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  const toggleRecording = useCallback(() => {
    setRecording(r => !r)
    recordingRef.current = !recordingRef.current
    if (!recording) setSessionTime(0)
  }, [recording])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Camera viewport */}
        <div className="relative flex-1 overflow-hidden bg-black">
          {/* Video (visible, mirrored source) */}
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted />

          {/* Main rendered canvas (no longer needed for video, keeping for structure) */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

          {/* Overlay canvas (landmarks, strings, particles) */}
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full object-cover" />

          {/* Idle state */}
          {!cameraActive && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.05) 0%, #050A1A 100%)' }}>
              <div className="absolute inset-0 grid-bg opacity-40" />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center"
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
                  style={{
                    background: 'rgba(0,245,255,0.06)',
                    border: '2px solid rgba(0,245,255,0.2)',
                    boxShadow: '0 0 60px rgba(0,245,255,0.15)',
                  }}
                >
                  <Hand className="w-16 h-16" style={{ color: '#00F5FF', filter: 'drop-shadow(0 0 12px #00F5FF)' }} />
                </div>

                <h2 className="font-orbitron font-bold text-3xl mb-3 text-white">Hand Lab</h2>
                <p className="font-exo text-base mb-8 max-w-md" style={{ color: 'rgba(224,232,255,0.55)' }}>
                  Track 21 landmarks per hand in real-time.<br />
                  Elastic neon strings connect your fingertips.
                </p>

                <MagneticButton variant="fill" className="text-sm py-3 px-8" onClick={startCamera}>
                  <Camera className="w-4 h-4" />
                  Activate Camera
                </MagneticButton>

                <div className="flex items-center gap-6 mt-8 justify-center">
                  {['21 Landmarks', 'Elastic Strings', 'Particle FX', 'AI Gestures'].map(f => (
                    <div key={f} className="flex items-center gap-1.5 font-exo text-xs" style={{ color: 'rgba(0,245,255,0.6)' }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: '#00F5FF' }} />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(5,10,26,0.8)' }}>
              <div className="text-center">
                <div className="spinner-neon w-12 h-12 mx-auto mb-4" />
                <p className="font-exo text-sm" style={{ color: '#00F5FF' }}>Loading MediaPipe...</p>
              </div>
            </div>
          )}

          {/* HUD Overlays */}
          {cameraActive && (
            <>
              {/* Top-left: Status */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(5,10,26,0.8)', border: '1px solid rgba(0,245,255,0.25)', color: '#00F5FF', backdropFilter: 'blur(8px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
                  TRACKING · {fps} FPS
                </div>

                {recording && (
                  <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', color: '#FF4444', backdropFilter: 'blur(8px)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    REC · {formatTime(sessionTime)}
                  </div>
                )}
              </div>

              {/* Top-right: Gesture */}
              {gesture && (
                <motion.div
                  key={gesture.gesture}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="absolute top-4 right-4"
                >
                  <div className="px-4 py-3 rounded-xl text-right"
                    style={{
                      background: 'rgba(5,10,26,0.85)',
                      border: `1px solid ${GESTURE_COLORS[gesture.gesture] ?? '#00F5FF'}40`,
                      backdropFilter: 'blur(12px)',
                      boxShadow: `0 0 20px ${GESTURE_COLORS[gesture.gesture] ?? '#00F5FF'}20`,
                    }}>
                    <div className="font-exo text-xs mb-1" style={{ color: 'rgba(224,232,255,0.45)' }}>DETECTED GESTURE</div>
                    <div className="font-orbitron font-bold text-base" style={{ color: GESTURE_COLORS[gesture.gesture] ?? '#00F5FF', textTransform: 'uppercase' }}>
                      {gesture.gesture.replace('_', ' ')}
                    </div>
                    <div className="font-mono text-xs mt-1" style={{ color: 'rgba(224,232,255,0.45)' }}>
                      {(gesture.confidence * 100).toFixed(1)}% conf
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bottom: Hand landmark count */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {landmarksRef.current.left && (
                  <div className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00F5FF' }}>
                    LEFT ✓
                  </div>
                )}
                {landmarksRef.current.right && (
                  <div className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.25)', color: '#FF00FF' }}>
                    RIGHT ✓
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Controls Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'rgba(5,10,26,0.98)', borderTop: '1px solid rgba(0,245,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            {!cameraActive ? (
              <MagneticButton variant="fill" className="text-xs py-2 px-4" onClick={startCamera} disabled={loading}>
                <Camera className="w-3.5 h-3.5" /> Start Camera
              </MagneticButton>
            ) : (
              <MagneticButton variant="magenta" className="text-xs py-2 px-4" onClick={stopCamera}>
                <CameraOff className="w-3.5 h-3.5" /> Stop
              </MagneticButton>
            )}

            {cameraActive && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className="flex items-center gap-1.5 px-4 py-2 rounded font-exo text-xs font-medium transition-all"
                style={{
                  background: recording ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${recording ? 'rgba(255,68,68,0.35)' : 'rgba(255,255,255,0.12)'}`,
                  color: recording ? '#FF4444' : 'rgba(224,232,255,0.7)',
                  cursor: 'none',
                }}
              >
                {recording ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {recording ? 'Stop Recording' : 'Record Session'}
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowSettings(s => !s)}
              className="flex items-center gap-1.5 px-3 py-2 rounded font-exo text-xs transition-all"
              style={{
                background: showSettings ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${showSettings ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: showSettings ? '#00F5FF' : 'rgba(224,232,255,0.6)',
                cursor: 'none',
              }}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Settings
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Panel: Settings + Gesture Log */}
      <div
        className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ background: 'rgba(5,10,26,0.98)', borderLeft: '1px solid rgba(0,245,255,0.1)' }}
      >
        {/* Panel Header */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
          <h3 className="font-orbitron font-semibold text-sm text-white">Lab Controls</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Settings Toggles */}
          <div>
            <h4 className="font-exo text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(0,245,255,0.5)' }}>Visual Effects</h4>
            {[
              { key: 'elasticStrings', label: 'Elastic Strings', color: '#00F5FF' },
              { key: 'particleExplosion', label: 'Particle Explosions', color: '#FFE500' },
              { key: 'showLandmarks', label: 'Show Landmarks', color: '#FF00FF' },
              { key: 'neonGlow', label: 'Neon Glow', color: '#00FF88' },
              { key: 'crtEffect', label: 'CRT Effect', color: '#8B00FF' },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between py-2">
                <span className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.7)' }}>{opt.label}</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, [opt.key]: !s[opt.key as keyof typeof s] }))}
                  className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                  style={{
                    background: settings[opt.key as keyof typeof settings]
                      ? `${opt.color}40`
                      : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${settings[opt.key as keyof typeof settings] ? opt.color : 'rgba(255,255,255,0.15)'}`,
                    cursor: 'none',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                    style={{
                      left: settings[opt.key as keyof typeof settings] ? 'calc(100% - 18px)' : '2px',
                      background: settings[opt.key as keyof typeof settings] ? opt.color : 'rgba(224,232,255,0.4)',
                      boxShadow: settings[opt.key as keyof typeof settings] ? `0 0 8px ${opt.color}` : 'none',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* String Thickness Slider */}
          <div>
            <h4 className="font-exo text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(0,245,255,0.5)' }}>String Thickness</h4>
            <input
              type="range" min="1" max="5" step="0.5"
              value={settings.stringThickness}
              onChange={e => setSettings(s => ({ ...s, stringThickness: Number(e.target.value) }))}
              className="w-full"
              style={{ accentColor: '#00F5FF', cursor: 'none' }}
            />
            <div className="flex justify-between font-mono text-xs mt-1" style={{ color: 'rgba(224,232,255,0.35)' }}>
              <span>Thin</span>
              <span style={{ color: '#00F5FF' }}>{settings.stringThickness}px</span>
              <span>Thick</span>
            </div>
          </div>

          {/* Gesture Reference */}
          <div>
            <h4 className="font-exo text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(0,245,255,0.5)' }}>Gesture Guide</h4>
            {[
              { gesture: '✊', label: 'Fist', color: '#FF00FF' },
              { gesture: '✌️', label: 'Peace', color: '#00F5FF' },
              { gesture: '🖐️', label: 'Open Palm', color: '#00FF88' },
              { gesture: '🤏', label: 'Pinch', color: '#FFE500' },
              { gesture: '👆', label: 'Pointing', color: '#8B00FF' },
            ].map(g => (
              <div key={g.label} className="flex items-center gap-3 py-1.5">
                <span className="text-lg">{g.gesture}</span>
                <span className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.65)' }}>{g.label}</span>
                <div className="ml-auto w-2 h-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }} />
              </div>
            ))}
          </div>

          {/* Current gesture big display */}
          {gesture && (
            <motion.div
              key={gesture.gesture}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 text-center"
              style={{
                background: `${GESTURE_COLORS[gesture.gesture] ?? '#00F5FF'}10`,
                border: `1px solid ${GESTURE_COLORS[gesture.gesture] ?? '#00F5FF'}30`,
              }}
            >
              <div className="font-exo text-xs mb-2" style={{ color: 'rgba(224,232,255,0.45)' }}>CURRENT GESTURE</div>
              <div className="font-orbitron font-bold text-xl mb-1" style={{ color: GESTURE_COLORS[gesture.gesture] ?? '#00F5FF', textTransform: 'uppercase' }}>
                {gesture.gesture.replace('_', ' ')}
              </div>
              <div className="font-mono text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>
                Confidence: {(gesture.confidence * 100).toFixed(1)}%
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  animate={{ width: `${gesture.confidence * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: GESTURE_COLORS[gesture.gesture] ?? '#00F5FF' }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
