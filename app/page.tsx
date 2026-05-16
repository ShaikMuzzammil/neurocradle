'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { NavBar } from '@/components/ui/NavBar'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  Brain, Zap, Hand, Code2, Shield, ArrowRight,
  Activity, Layers, Sparkles, Star, TrendingUp,
} from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

// ─── Particle Canvas ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let animId: number

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string; pulse: number; pulseSpeed: number
    }

    const colors = ['#00F5FF', '#FF00FF', '#FFE500', '#00FF88', '#8B00FF']
    const particles: Particle[] = []

    for (let i = 0; i < 120; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      })
    }

    let mx = W / 2, my = H / 2
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    function draw() {
      ctx.fillStyle = 'rgba(5, 10, 26, 0.15)'
      ctx.fillRect(0, 0, W, H)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,245,255,${(1 - dist / 120) * 0.08})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Mouse connection
      particles.forEach(p => {
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mx, my)
          const alpha = (1 - dist / 160) * 0.2
          ctx.strokeStyle = `rgba(0,245,255,${alpha})`
          ctx.lineWidth = 1
          ctx.stroke()

          // Mouse repel
          const force = (160 - dist) / 160 * 0.5
          p.vx += (dx / dist) * force * 0.05
          p.vy += (dy / dist) * force * 0.05
        }

        // Update
        p.pulse += p.pulseSpeed
        const pulsedAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        p.vx += (Math.random() - 0.5) * 0.005
        p.vy += (Math.random() - 0.5) * 0.005
        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(')', `,${pulsedAlpha})`).replace('rgb', 'rgba').replace('##', 'rgba(')

        // Simpler approach
        const hex = p.color
        const r2 = parseInt(hex.slice(1, 3), 16)
        const g2 = parseInt(hex.slice(3, 5), 16)
        const b2 = parseInt(hex.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${pulsedAlpha})`
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.8 }}
    />
  )
}

// ─── Typewriter Effect ────────────────────────────────────────────────────────
function TypewriterText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing')

  useEffect(() => {
    const current = texts[index]
    let timeout: NodeJS.Timeout

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60)
      } else {
        timeout = setTimeout(() => setPhase('pause'), 1800)
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => setPhase('deleting'), 500)
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
      } else {
        setIndex((index + 1) % texts.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase, index, texts])

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        style={{ color: '#00F5FF' }}
      >_</motion.span>
    </span>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Hand className="w-6 h-6" />,
    title: 'Real-Time Hand Tracking',
    desc: 'MediaPipe + p5.js fusion — 21 landmarks per hand, elastic neon strings, particle explosions on touch.',
    color: '#00F5FF',
    tag: 'LIVE',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Gesture Classification',
    desc: 'Python FastAPI ML classifier recognizing fist, peace, pinch, pointing, open palm in real-time via WebSocket.',
    color: '#FF00FF',
    tag: 'AI',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Gesture-to-Code',
    desc: 'Your hands generate code. Wave, point, or pinch — NeuroCradle translates gestures into functional snippets.',
    color: '#FFE500',
    tag: 'NEW',
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Algorithm Visualizer',
    desc: 'Control Bubble Sort, BFS, Dijkstra speed with your hand spread. The more you open, the faster it runs.',
    color: '#00FF88',
    tag: 'LIVE',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Gesture Art Gallery',
    desc: 'Your hand movements become art. Save frames to Supabase Storage, like and comment in real-time.',
    color: '#8B00FF',
    tag: 'BETA',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Session Analytics',
    desc: 'Recharts heatmaps tracking your gesture history, session duration, landmark accuracy over time.',
    color: '#FF00FF',
    tag: 'ANALYTICS',
  },
]

const stats = [
  { value: 21, suffix: '', label: 'Landmarks Tracked', color: '#00F5FF' },
  { value: 60, suffix: 'fps', label: 'Real-Time Speed', color: '#FF00FF' },
  { value: 5, suffix: '+', label: 'Gesture Classes', color: '#FFE500' },
  { value: 99, suffix: '%', label: 'Accuracy Rate', color: '#00FF88' },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'ML Engineer @ DeepMind',
    text: 'NeuroCradle changed how I prototype. Gesture-to-code is genuinely magical.',
    avatar: 'SC',
    color: '#00F5FF',
  },
  {
    name: 'Marcus Webb',
    role: 'Creative Technologist',
    text: 'The hand lab is unlike anything I\'ve seen. Elastic strings, particle explosions — pure art.',
    avatar: 'MW',
    color: '#FF00FF',
  },
  {
    name: 'Aiko Tanaka',
    role: 'Frontend Developer',
    text: 'This is what the future feels like. The gestures control the algorithm — I\'m obsessed.',
    avatar: 'AT',
    color: '#FFE500',
  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 180])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <div className="min-h-screen bg-midnight overflow-hidden">
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Particle Background */}
        <ParticleCanvas />

        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Radial glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,245,255,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,0,255,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />



        {/* Hero Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.25)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-neon animate-pulse" style={{ background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />
            <span className="font-exo text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#00F5FF' }}>
              Live AI System Online
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-orbitron font-black leading-[0.9] mb-6"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
          >
            <span
              className="block"
              style={{
                color: '#00F5FF',
                textShadow: '0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2)',
              }}
            >
              NEURO
            </span>
            <span
              className="block text-glitch"
              data-text="CRADLE"
              style={{
                color: '#FF00FF',
                textShadow: '0 0 20px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.2)',
              }}
            >
              CRADLE
            </span>
          </motion.h1>

          {/* Tagline Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-mono text-lg md:text-2xl mb-10 h-10 flex items-center justify-center"
            style={{ color: 'rgba(224,232,255,0.7)' }}
          >
            <span style={{ color: '#00F5FF', marginRight: 8 }}>{'>'}</span>
            <TypewriterText texts={[
              'Track hands in real-time',
              'Classify gestures with AI',
              'Draw with your fingertips',
              'Control algorithms by hand',
              'The future of HCI is here',
            ]} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <MagneticButton variant="cyan" className="text-sm py-3 px-10" href="/login">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </motion.div>

          {/* Floating chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {['MediaPipe', 'FastAPI', 'Next.js 14', 'Supabase', 'WebSocket', 'p5.js'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.07 }}
                className="font-mono text-xs px-3 py-1.5 rounded"
                style={{
                  background: 'rgba(0,245,255,0.06)',
                  border: '1px solid rgba(0,245,255,0.15)',
                  color: 'rgba(0,245,255,0.7)',
                }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-exo text-xs tracking-widest uppercase" style={{ color: 'rgba(0,245,255,0.4)' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(0,245,255,0.5), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section ref={statsRef} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'rgba(0,245,255,0.03)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center p-6 rounded-xl"
                style={{
                  background: 'rgba(7,13,34,0.8)',
                  border: `1px solid ${stat.color}22`,
                  borderTop: `2px solid ${stat.color}`,
                  boxShadow: `0 -4px 20px ${stat.color}33`,
                }}
              >
                <div
                  className="font-orbitron font-black text-4xl md:text-5xl mb-2"
                  style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}80` }}
                >
                  {statsInView ? (
                    <CountUp end={stat.value} duration={2} suffix={stat.suffix} />
                  ) : '0'}
                </div>
                <div className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.5)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ border: '1px solid rgba(255,0,255,0.3)', background: 'rgba(255,0,255,0.06)' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#FF00FF' }} />
              <span className="font-exo text-xs uppercase tracking-widest" style={{ color: '#FF00FF' }}>Features</span>
            </div>
            <h2 className="font-orbitron font-bold text-4xl md:text-5xl mb-6" style={{ color: '#e0e8ff' }}>
              Everything you need to
              <br />
              <span style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>control the future</span>
            </h2>
            <p className="font-exo text-lg max-w-2xl mx-auto" style={{ color: 'rgba(224,232,255,0.55)' }}>
              NeuroCradle fuses real-time computer vision, ML gesture classification, and developer tooling into one seamless interface.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              >
                <GlassCard
                  className="p-6 h-full"
                  glow={i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'magenta' : 'yellow'}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${f.color}18`,
                        border: `1px solid ${f.color}30`,
                        color: f.color,
                        boxShadow: `0 0 20px ${f.color}20`,
                      }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-orbitron font-semibold text-sm text-white">{f.title}</h3>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}30` }}
                        >
                          {f.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-exo text-sm leading-relaxed" style={{ color: 'rgba(224,232,255,0.55)' }}>
                    {f.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO SECTION ─────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,245,255,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full" style={{ border: '1px solid rgba(0,245,255,0.3)', background: 'rgba(0,245,255,0.06)' }}>
                <Hand className="w-3 h-3" style={{ color: '#00F5FF' }} />
                <span className="font-exo text-xs uppercase tracking-widest" style={{ color: '#00F5FF' }}>Hand Lab</span>
              </div>
              <h2 className="font-orbitron font-bold text-4xl md:text-5xl mb-6 leading-tight">
                <span style={{ color: '#e0e8ff' }}>Your hands become</span>
                <br />
                <span style={{ color: '#FF00FF', textShadow: '0 0 20px rgba(255,0,255,0.4)' }}>the interface</span>
              </h2>
              <p className="font-exo text-base leading-relaxed mb-8" style={{ color: 'rgba(224,232,255,0.6)' }}>
                Open the Hand Lab and watch as NeuroCradle maps 21 landmarks per hand in real-time.
                Elastic neon strings connect your fingertips across both hands. Touch and trigger
                particle explosions. Every gesture is classified by our ML backend in milliseconds.
              </p>
              <div className="flex flex-col gap-3 mb-10">
                {[
                  '21 hand landmarks tracked at 60fps',
                  'Cross-hand elastic string physics',
                  'ML gesture classification via WebSocket',
                  'Session recording to Supabase Storage',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 font-exo text-sm"
                    style={{ color: 'rgba(224,232,255,0.7)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00F5FF', boxShadow: '0 0 6px #00F5FF' }} />
                    {item}
                  </motion.div>
                ))}
              </div>
              <MagneticButton variant="fill" href="/login">
                <Zap className="w-4 h-4" /> Get Started Free
              </MagneticButton>
            </motion.div>

            {/* Right: Preview UI */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div
                className="rounded-2xl overflow-hidden aspect-video relative"
                style={{
                  background: 'rgba(5,10,26,0.9)',
                  border: '1px solid rgba(0,245,255,0.2)',
                  boxShadow: '0 0 60px rgba(0,245,255,0.15), 0 0 120px rgba(255,0,255,0.08)',
                }}
              >
                {/* Simulated hand lab preview */}
                <div className="absolute inset-0 grid-bg-fast opacity-30" />

                {/* Advanced 21-landmark dual hand tracking SVG */}
                <svg viewBox="0 0 400 225" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.4))' }}>
                  <defs>
                    <linearGradient id="elasticGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F5FF" />
                      <stop offset="50%" stopColor="#FF00FF" />
                      <stop offset="100%" stopColor="#FFE500" />
                    </linearGradient>
                    <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>

                  {/* LEFT HAND - 21 landmarks: wrist + 4 fingers x 4 + thumb x 4 */}
                  {/* Palm base */}
                  {[[75,165],[85,155],[90,150],[88,145]].map(([x,y],i)=>(
                    <circle key={`lp${i}`} cx={x} cy={y} r="2.5" fill="#00F5FF" opacity="0.9" filter="url(#glow)">
                      <animate attributeName="opacity" values="0.9;0.5;0.9" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
                    </circle>
                  ))}
                  {/* Thumb L */}
                  {[[78,155],[72,148],[67,143],[63,139],[60,136]].map(([x,y],i)=>(
                    <circle key={`lt${i}`} cx={x} cy={y} r="2" fill="#00F5FF" opacity="0.8"/>
                  ))}
                  {/* Index L */}
                  {[[88,148],[90,135],[91,122],[92,110],[93,100]].map(([x,y],i)=>(
                    <circle key={`li${i}`} cx={x} cy={y} r="2" fill="#00F5FF" opacity="0.8">
                      <animate attributeName="cy" values={`${y};${y-3};${y}`} dur="2s" repeatCount="indefinite" begin={`${i*0.15}s`}/>
                    </circle>
                  ))}
                  {/* Middle L */}
                  {[[92,148],[95,133],[97,118],[98,105],[99,94]].map(([x,y],i)=>(
                    <circle key={`lm${i}`} cx={x} cy={y} r="2" fill="#00DDFF" opacity="0.8"/>
                  ))}
                  {/* Ring L */}
                  {[[97,150],[101,136],[103,122],[104,110],[105,100]].map(([x,y],i)=>(
                    <circle key={`lr${i}`} cx={x} cy={y} r="2" fill="#00F5FF" opacity="0.7"/>
                  ))}
                  {/* Pinky L */}
                  {[[102,153],[106,141],[108,130],[109,121],[110,113]].map(([x,y],i)=>(
                    <circle key={`lk${i}`} cx={x} cy={y} r="1.5" fill="#00F5FF" opacity="0.6"/>
                  ))}
                  {/* Bone connections Left */}
                  <line x1="75" y1="165" x2="60" y2="136" stroke="#00F5FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="75" y1="165" x2="93" y2="100" stroke="#00F5FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="75" y1="165" x2="99" y2="94" stroke="#00F5FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="75" y1="165" x2="105" y2="100" stroke="#00F5FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="75" y1="165" x2="110" y2="113" stroke="#00F5FF" strokeWidth="0.8" opacity="0.4"/>

                  {/* RIGHT HAND - mirrored */}
                  {[[325,165],[315,155],[310,150],[312,145]].map(([x,y],i)=>(
                    <circle key={`rp${i}`} cx={x} cy={y} r="2.5" fill="#FF00FF" opacity="0.9" filter="url(#glow)">
                      <animate attributeName="opacity" values="0.9;0.5;0.9" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" begin={`${i*0.2+0.5}s`}/>
                    </circle>
                  ))}
                  {/* Thumb R */}
                  {[[322,155],[328,148],[333,143],[337,139],[340,136]].map(([x,y],i)=>(
                    <circle key={`rt${i}`} cx={x} cy={y} r="2" fill="#FF00FF" opacity="0.8"/>
                  ))}
                  {/* Index R */}
                  {[[312,148],[310,135],[309,122],[308,110],[307,100]].map(([x,y],i)=>(
                    <circle key={`ri${i}`} cx={x} cy={y} r="2" fill="#FF00FF" opacity="0.8">
                      <animate attributeName="cy" values={`${y};${y-3};${y}`} dur="2s" repeatCount="indefinite" begin={`${i*0.15+0.3}s`}/>
                    </circle>
                  ))}
                  {/* Middle R */}
                  {[[308,148],[305,133],[303,118],[302,105],[301,94]].map(([x,y],i)=>(
                    <circle key={`rm${i}`} cx={x} cy={y} r="2" fill="#DD00FF" opacity="0.8"/>
                  ))}
                  {/* Ring R */}
                  {[[303,150],[299,136],[297,122],[296,110],[295,100]].map(([x,y],i)=>(
                    <circle key={`rr${i}`} cx={x} cy={y} r="2" fill="#FF00FF" opacity="0.7"/>
                  ))}
                  {/* Pinky R */}
                  {[[298,153],[294,141],[292,130],[291,121],[290,113]].map(([x,y],i)=>(
                    <circle key={`rk${i}`} cx={x} cy={y} r="1.5" fill="#FF00FF" opacity="0.6"/>
                  ))}
                  {/* Bone connections Right */}
                  <line x1="325" y1="165" x2="340" y2="136" stroke="#FF00FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="325" y1="165" x2="307" y2="100" stroke="#FF00FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="325" y1="165" x2="301" y2="94" stroke="#FF00FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="325" y1="165" x2="295" y2="100" stroke="#FF00FF" strokeWidth="0.8" opacity="0.4"/>
                  <line x1="325" y1="165" x2="290" y2="113" stroke="#FF00FF" strokeWidth="0.8" opacity="0.4"/>

                  {/* Cross-hand elastic connection strings: fingertip to fingertip */}
                  <path d="M 93,100 C 180,50 220,50 307,100" stroke="url(#elasticGrad)" strokeWidth="1.5" fill="none" opacity="0.7">
                    <animate attributeName="d" values="M 93,100 C 180,50 220,50 307,100;M 93,100 C 180,30 220,30 307,100;M 93,100 C 180,50 220,50 307,100" dur="3s" repeatCount="indefinite"/>
                  </path>
                  <path d="M 99,94 C 180,40 220,40 301,94" stroke="url(#elasticGrad)" strokeWidth="1" fill="none" opacity="0.5">
                    <animate attributeName="d" values="M 99,94 C 180,40 220,40 301,94;M 99,94 C 180,15 220,15 301,94;M 99,94 C 180,40 220,40 301,94" dur="3.5s" repeatCount="indefinite"/>
                  </path>
                  <path d="M 60,136 C 150,90 250,90 340,136" stroke="url(#elasticGrad)" strokeWidth="0.8" fill="none" opacity="0.35"/>
                  <path d="M 110,113 C 180,80 220,80 290,113" stroke="url(#elasticGrad)" strokeWidth="0.8" fill="none" opacity="0.3"/>

                  {/* Midpoint particle burst */}
                  {[[197,55],[200,48],[203,60],[193,52],[207,54]].map(([x,y],i)=>(
                    <circle key={`mp${i}`} cx={x} cy={y} r="2" fill="#FFE500" filter="url(#glow)">
                      <animate attributeName="cy" values={`${y};${y-12};${y}`} dur={`${0.8+i*0.15}s`} repeatCount="indefinite" begin={`${i*0.18}s`}/>
                      <animate attributeName="opacity" values="1;0;1" dur={`${0.8+i*0.15}s`} repeatCount="indefinite" begin={`${i*0.18}s`}/>
                      <animate attributeName="r" values="2;3;2" dur={`${0.8+i*0.15}s`} repeatCount="indefinite"/>
                    </circle>
                  ))}
                </svg>

                {/* Overlay labels */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs" style={{ color: '#00F5FF' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ background: '#00FF88' }} />
                    TRACKING ACTIVE
                  </div>
                </div>
                <div className="absolute top-4 right-4 font-mono text-xs" style={{ color: 'rgba(0,245,255,0.6)' }}>
                  60 FPS
                </div>
                <div className="absolute bottom-4 left-4 font-exo text-xs" style={{ color: '#FF00FF' }}>
                  GESTURE: PEACE ✌️
                </div>
                <div className="absolute bottom-4 right-4 font-mono text-xs" style={{ color: '#FFE500' }}>
                  CONF: 97.3%
                </div>
              </div>

              {/* Decorative blobs */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(0,245,255,0.15)' }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(255,0,255,0.12)' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FFE500' }} />
              ))}
            </div>
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl" style={{ color: '#e0e8ff' }}>
              Loved by <span style={{ color: '#00F5FF' }}>builders</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 h-full" glow={i === 0 ? 'cyan' : i === 1 ? 'magenta' : 'yellow'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-sm flex-shrink-0"
                      style={{ background: `${t.color}20`, border: `1px solid ${t.color}40`, color: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-exo font-semibold text-sm text-white">{t.name}</div>
                      <div className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>{t.role}</div>
                    </div>
                  </div>
                  <p className="font-exo text-sm leading-relaxed" style={{ color: 'rgba(224,232,255,0.65)' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,245,255,0.1) 0%, rgba(255,0,255,0.05) 50%, transparent 100%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="font-orbitron font-black text-5xl md:text-6xl mb-6">
            <span className="gradient-text-cyber">
              Start Tracking
            </span>
            <br />
            <span style={{ color: '#e0e8ff' }}>Today</span>
          </h2>
          <p className="font-exo text-lg mb-10" style={{ color: 'rgba(224,232,255,0.55)' }}>
            Free forever. No credit card. No limits on hand tracking.
            Connect your hands to the future right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton variant="fill" className="text-base py-4 px-10" href="/login">
              <Zap className="w-4 h-4" />
              Launch NeuroCradle
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      <footer className="relative border-t py-12 px-6" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" style={{ color: '#00F5FF' }} />
            <span className="font-orbitron font-bold" style={{ color: '#00F5FF' }}>NEURO<span style={{ color: '#FF00FF' }}>CRADLE</span></span>
          </div>
          <MagneticButton variant="cyan" className="text-sm py-2 px-6" href="/login">
            Launch App
          </MagneticButton>
          <div className="font-mono text-xs" style={{ color: 'rgba(224,232,255,0.3)' }}>
            © 2025 NeuroCradle. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
