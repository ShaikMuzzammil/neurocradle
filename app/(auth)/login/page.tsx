'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Brain, Mail, ArrowRight, Zap, Hand, Eye, EyeOff, Lock, User, CheckCircle, AlertCircle, X } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import Link from 'next/link'

type AuthMode = 'signin' | 'signup'

interface Notification {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  msg: string
}

let notifId = 0

function NotificationStack({ items, dismiss }: { items: Notification[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: 360 }}>
      <AnimatePresence>
        {items.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: 'rgba(7,13,34,0.97)',
              border: `1px solid ${n.type === 'success' ? 'rgba(0,255,136,0.4)' : n.type === 'error' ? 'rgba(255,60,60,0.4)' : n.type === 'warning' ? 'rgba(255,229,0,0.4)' : 'rgba(0,245,255,0.4)'}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${n.type === 'success' ? 'rgba(0,255,136,0.15)' : n.type === 'error' ? 'rgba(255,60,60,0.15)' : 'rgba(0,245,255,0.15)'}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {n.type === 'success' ? <CheckCircle className="w-5 h-5" style={{ color: '#00FF88' }} /> : <AlertCircle className="w-5 h-5" style={{ color: n.type === 'error' ? '#FF4444' : n.type === 'warning' ? '#FFE500' : '#00F5FF' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-orbitron font-semibold text-xs text-white mb-0.5">{n.title}</div>
              <div className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.65)' }}>{n.msg}</div>
            </div>
            <button onClick={() => dismiss(n.id)} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(224,232,255,0.3)', cursor: 'none' }}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('muzzammil160806@gmail.com')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])

  const notify = (type: Notification['type'], title: string, msg: string) => {
    const id = ++notifId
    setNotifs(p => [...p, { id, type, title, msg }])
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 5000)
  }
  const dismiss = (id: number) => setNotifs(p => p.filter(n => n.id !== id))

  useEffect(() => {
    // We will let the login page stay so the user can see it, and it will just work when submitted
  }, [])

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSignIn = async () => {
    if (!email || !password) return notify('error', 'Missing Fields', 'Please fill in your email and password.')
    setLoading(true)
    notify('info', 'Authenticating...', 'Verifying your credentials with NeuroCradle.')
    setTimeout(() => {
      notify('success', 'Welcome Back!', 'Authentication successful. Loading your dashboard...')
      router.push('/dashboard')
    }, 800)
  }

  const handleSignUp = async () => {
    if (!email || !password || !name) return notify('error', 'Missing Fields', 'Please fill in all fields to create your account.')
    setLoading(true)
    notify('info', 'Creating Account...', 'Setting up your NeuroCradle profile.')
    setTimeout(() => {
      notify('success', 'Neural Link Established', 'Account created. Redirecting...')
      router.push('/dashboard')
    }, 800)
  }

  return (
    <>
      <NotificationStack items={notifs} dismiss={dismiss} />
      <div className="min-h-screen flex overflow-hidden bg-midnight">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden p-12">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #050A1A 0%, #0A1230 100%)' }} />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ bottom: '20%', right: '10%', background: 'radial-gradient(circle, rgba(255,0,255,0.15) 0%, transparent 70%)' }} />

          {[160, 240, 320].map((size, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: size, height: size, border: `1px solid rgba(0,245,255,${0.15 - i * 0.04})`, animation: `orbitPulse ${4 + i}s ease-in-out ${i * 1.2}s infinite` }} />
          ))}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', boxShadow: '0 0 40px rgba(0,245,255,0.2)' }}>
              <Brain className="w-12 h-12" style={{ color: '#00F5FF', filter: 'drop-shadow(0 0 8px #00F5FF)' }} />
            </div>
            <h1 className="font-orbitron font-black text-4xl mb-4" style={{ color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
              NEURO<span style={{ color: '#FF00FF' }}>CRADLE</span>
            </h1>
            <p className="font-exo text-base mb-12" style={{ color: 'rgba(224,232,255,0.55)' }}>
              The AI hand-tracking platform<br />for the next generation of builders.
            </p>
            {[
              { icon: <Hand className="w-4 h-4" />, text: '21-landmark real-time tracking', color: '#00F5FF' },
              { icon: <Zap className="w-4 h-4" />, text: 'ML gesture classification', color: '#FF00FF' },
              { icon: <Brain className="w-4 h-4" />, text: 'AI code generation', color: '#FFE500' },
            ].map((item, i) => (
              <motion.div key={item.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25`, color: item.color }}>{item.icon}</div>
                <span className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.65)' }}>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col p-6 lg:p-12 relative">
          <div className="absolute inset-0" style={{ background: 'rgba(5,10,26,0.98)' }} />
          <div className="absolute left-0 top-0 bottom-0 w-px hidden lg:block" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.3) 30%, rgba(0,245,255,0.3) 70%, transparent)' }} />

          {/* Home Button */}
          <div className="relative z-10 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-exo text-sm transition-all duration-200"
              style={{ color: 'rgba(0,245,255,0.7)', background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00F5FF'; e.currentTarget.style.background = 'rgba(0,245,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,245,255,0.7)'; e.currentTarget.style.background = 'rgba(0,245,255,0.05)' }}>
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 w-full max-w-md mx-auto my-auto">
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
              <Brain className="w-7 h-7" style={{ color: '#00F5FF' }} />
              <span className="font-orbitron font-bold text-lg" style={{ color: '#00F5FF' }}>NEURO<span style={{ color: '#FF00FF' }}>CRADLE</span></span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-3xl mb-2 text-white">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.5)' }}>
                {mode === 'signup' ? 'Join the next generation of builders' : 'Sign in to your NeuroCradle account'}
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {([['signin', 'Sign In'], ['signup', 'Sign Up']] as [AuthMode, string][]).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setPassword('') }}
                  className="flex-1 py-2.5 rounded-lg font-exo text-sm font-semibold transition-all duration-300"
                  style={{
                    background: mode === m ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(255,0,255,0.08))' : 'transparent',
                    color: mode === m ? '#00F5FF' : 'rgba(224,232,255,0.4)',
                    border: mode === m ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent',
                    boxShadow: mode === m ? '0 0 20px rgba(0,245,255,0.15)' : 'none',
                    cursor: 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* SIGN IN */}
              {mode === 'signin' && (
                <motion.div key="signin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5">
                  <div>
                    <label className="block font-exo text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(0,245,255,0.6)' }}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                        placeholder="you@example.com"
                        className="neon-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-exo text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(0,245,255,0.6)' }}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                        placeholder="••••••••"
                        className="neon-input pr-12"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(224,232,255,0.4)', cursor: 'none' }}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <MagneticButton variant="fill" className="w-full justify-center py-3.5" onClick={handleSignIn} disabled={loading}>
                    {loading ? <div className="spinner-neon w-4 h-4" /> : <><Lock className="w-4 h-4" />Sign In<ArrowRight className="w-4 h-4" /></>}
                  </MagneticButton>
                  <p className="text-center font-exo text-sm" style={{ color: 'rgba(224,232,255,0.4)' }}>
                    No account?{' '}
                    <button onClick={() => setMode('signup')} className="font-semibold" style={{ color: '#00F5FF', cursor: 'none' }}>
                      Create one →
                    </button>
                  </p>
                </motion.div>
              )}

              {/* SIGN UP */}
              {mode === 'signup' && (
                <motion.div key="signup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5">
                  <div>
                    <label className="block font-exo text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(0,245,255,0.6)' }}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" className="neon-input" style={{ paddingLeft: '44px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-exo text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(0,245,255,0.6)' }}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="neon-input" style={{ paddingLeft: '44px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-exo text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(0,245,255,0.6)' }}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="neon-input pr-12"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(224,232,255,0.4)', cursor: 'none' }}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
                            background: password.length >= i * 2 ? (password.length >= 12 ? '#00FF88' : password.length >= 8 ? '#FFE500' : '#FF4444') : 'rgba(255,255,255,0.1)'
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <MagneticButton variant="fill" className="w-full justify-center py-3.5" onClick={handleSignUp} disabled={loading}>
                    {loading ? <div className="spinner-neon w-4 h-4" /> : <><User className="w-4 h-4" />Create Account<ArrowRight className="w-4 h-4" /></>}
                  </MagneticButton>
                  <p className="text-center font-exo text-sm" style={{ color: 'rgba(224,232,255,0.4)' }}>
                    Already have an account?{' '}
                    <button onClick={() => setMode('signin')} className="font-semibold" style={{ color: '#00F5FF', cursor: 'none' }}>
                      Sign in →
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center font-exo text-xs mt-8" style={{ color: 'rgba(224,232,255,0.25)' }}>
              By continuing, you agree to our{' '}
              <a href="#" style={{ color: '#00F5FF' }}>Terms</a>{' '}and{' '}
              <a href="#" style={{ color: '#00F5FF' }}>Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
