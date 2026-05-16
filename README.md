# 🧠 NeuroCradle

> The AI hand-tracking platform for the next generation of builders.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.4-blue)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3ECF8E?logo=supabase)

---

## ✨ Features

| Feature | Stack | Status |
|---|---|---|
| Real-time 21-landmark hand tracking | MediaPipe + p5.js | ✅ |
| Elastic neon strings + particle FX | Canvas API | ✅ |
| ML gesture classification | FastAPI + cosine-distance | ✅ |
| WebSocket real-time stream | FastAPI WS | ✅ |
| Gesture-to-Code translator | Python templates | ✅ |
| Algorithm visualizer (Bubble/BFS) | React + Canvas | ✅ |
| AI Code Reviewer | Claude API | ✅ |
| Session analytics heatmap | Recharts | ✅ |
| Gesture Art Gallery + likes | Supabase Realtime | ✅ |
| Multi-step contact form | Resend API | ✅ |
| Google/GitHub OAuth + Magic Link | Supabase Auth | ✅ |
| Custom neon cursor + trail | Vanilla JS | ✅ |
| CRT scanline overlay + vignette | CSS | ✅ |
| Animated nav flow path | CSS + React | ✅ |
| Magnetic hover buttons | Framer Motion | ✅ |
| CI/CD pipeline | GitHub Actions | ✅ |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/neurocradle
cd neurocradle
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws/gesture-stream
RESEND_API_KEY=re_...
CONTACT_EMAIL=hello@yourdomain.com
```

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in **SQL Editor**:
   ```
   supabase/migrations/20250101_init.sql
   ```
3. Enable Google + GitHub OAuth in **Authentication > Providers**

### 4. Run Frontend

```bash
npm run dev
# → http://localhost:3000
```

### 5. Run Python Backend

```bash
cd python_backend
pip install -r requirements.txt
cp .env.example .env
# fill in ANTHROPIC_API_KEY
python main.py
# → http://localhost:8000
```

---

## 📁 Project Structure

```
neurocradle/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)/login/page.tsx       # Split-screen login
│   ├── contact/page.tsx            # Multi-step contact form
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── page.tsx                # Overview
│   │   ├── hand-lab/page.tsx       # MediaPipe tracking
│   │   ├── ai-tools/page.tsx       # 5-tab tool hub
│   │   ├── analytics/page.tsx      # Heatmaps + charts
│   │   ├── gallery/page.tsx        # Art gallery
│   │   └── settings/page.tsx       # Profile + prefs
│   └── api/
│       └── contact/route.ts        # Resend email API
├── components/
│   └── ui/
│       ├── CursorSystem.tsx        # Custom cursor + trail
│       ├── CRTOverlay.tsx          # Scanlines + vignette
│       ├── FlowPathLine.tsx        # Animated nav path
│       ├── NavBar.tsx              # Full navigation
│       ├── MagneticButton.tsx      # Framer Motion magnetic
│       └── GlassCard.tsx           # Glassmorphism card
├── hooks/
│   ├── useGestureWS.ts             # WebSocket hook
│   ├── useMediaPipe.ts             # MediaPipe hook
│   └── useSession.ts               # Supabase session hook
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── database.types.ts           # Generated DB types
│   └── utils.ts                    # Helpers
├── python_backend/
│   ├── main.py                     # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── supabase/
│   └── migrations/20250101_init.sql
├── .github/workflows/deploy.yml    # CI/CD
├── tailwind.config.js              # Full neon design system
└── .env.local.example
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `midnight` | `#050A1A` | Background |
| `cyan.neon` | `#00F5FF` | Primary accent |
| `magenta.neon` | `#FF00FF` | Secondary accent |
| `yellow.neon` | `#FFE500` | Highlights |
| `green.neon` | `#00FF88` | Success states |
| `font-orbitron` | Orbitron | Headlines |
| `font-mono` | JetBrains Mono | Code / data |
| `font-exo` | Exo 2 | Body / UI |

---

## 🔌 API Endpoints

```
POST /gesture/classify         Classify 21 landmarks → gesture
POST /analytics/session        Analyze session data
POST /tools/review-code        Claude AI code review
WS   /ws/gesture-stream        Real-time classification
GET  /health                   Health check
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel Dashboard.

### Backend → Railway

```bash
railway login
railway init
railway up
```

Or use the included `Dockerfile`.

### CI/CD

Push to `main` → GitHub Actions automatically:
- Lints + type-checks
- Deploys frontend to Vercel
- Deploys backend to Railway

---

## 📄 License

MIT © 2025 NeuroCradle
