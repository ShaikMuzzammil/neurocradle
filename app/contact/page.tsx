'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavBar } from '@/components/ui/NavBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import {
  Mail, User, MessageSquare, Send, Check,
  ArrowRight, ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 0 | 1 | 2 | 3
interface FormData {
  name: string; email: string; subject: string
  category: string; message: string; priority: string
}

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry', icon: '💬' },
  { value: 'technical', label: 'Technical Support', icon: '⚙️' },
  { value: 'collaboration', label: 'Collaboration', icon: '🤝' },
  { value: 'enterprise', label: 'Enterprise', icon: '🏢' },
  { value: 'bug', label: 'Bug Report', icon: '🐛' },
  { value: 'feature', label: 'Feature Request', icon: '✨' },
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, filter: 'blur(4px)', scale: 0.97 }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0, filter: 'blur(4px)', scale: 0.97 }),
}
const trs = { duration: 0.35, ease: [0.4, 0, 0.2, 1] }

export default function ContactPage() {
  const [step, setStep] = useState<Step>(0)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState<FormData>({ name:'',email:'',subject:'',category:'',message:'',priority:'Medium' })
  const [sending, setSending] = useState(false)

  const upd = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))
  const next = () => { setDir(1); setStep(s => Math.min(s+1,3) as Step) }
  const back = () => { setDir(-1); setStep(s => Math.max(s-1,0) as Step) }

  const submit = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      next()
      toast.success('Message sent!')
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const steps = [
    { label: 'Your Info', icon: <User className="w-4 h-4" /> },
    { label: 'Topic', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Message', icon: <Mail className="w-4 h-4" /> },
    { label: 'Done', icon: <Check className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-midnight overflow-hidden">
      <NavBar />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,0,255,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back to Home */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <a href="/" className="inline-flex items-center gap-2 font-exo text-sm transition-all duration-200"
              style={{ color: 'rgba(0,245,255,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00F5FF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,245,255,0.6)')}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
          </motion.div>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full"
              style={{ border:'1px solid rgba(0,245,255,0.25)', background:'rgba(0,245,255,0.06)' }}>
              <Mail className="w-3.5 h-3.5" style={{ color:'#00F5FF' }} />
              <span className="font-exo text-xs uppercase tracking-widest" style={{ color:'#00F5FF' }}>Get In Touch</span>
            </div>
            <h1 className="font-orbitron font-black text-5xl md:text-6xl mb-4">
              <span style={{ color:'#e0e8ff' }}>Contact</span><br/>
              <span style={{ color:'#00F5FF', textShadow:'0 0 20px rgba(0,245,255,0.4)' }}>Mission Control</span>
            </h1>
            <p className="font-exo text-base" style={{ color:'rgba(224,232,255,0.55)' }}>
              Questions, collaborations, or feedback — we respond within 24 hours.
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: i === step ? 1.1 : 1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: i < step ? 'rgba(0,255,136,0.15)' : i === step ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${i < step ? '#00FF88' : i === step ? '#00F5FF' : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: i === step ? '0 0 20px rgba(0,245,255,0.3)' : 'none',
                      color: i < step ? '#00FF88' : i === step ? '#00F5FF' : 'rgba(224,232,255,0.3)',
                    }}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : s.icon}
                  </motion.div>
                  <span className="font-exo text-[10px] mt-1.5 font-medium"
                    style={{ color: i === step ? '#00F5FF' : i < step ? '#00FF88' : 'rgba(224,232,255,0.3)' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-16 h-px mx-2 mt-[-18px]"
                    style={{
                      background: i < step ? 'linear-gradient(90deg,#00FF88,#00F5FF)' : 'rgba(255,255,255,0.1)',
                      transition: 'all 0.5s ease',
                    }} />
                )}
              </div>
            ))}
          </div>

          <GlassCard className="overflow-hidden relative" glow="cyan">
            {step < 3 && (
              <div className="absolute top-0 left-0 h-0.5 transition-all duration-700"
                style={{ width: `${(step/2)*100}%`, background:'linear-gradient(90deg,#00F5FF,#FF00FF)', boxShadow:'0 0 10px rgba(0,245,255,0.6)' }} />
            )}
            <div className="p-8">
              <AnimatePresence mode="wait" custom={dir}>
                {step === 0 && (
                  <motion.div key="s0" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={trs}>
                    <h2 className="font-orbitron font-bold text-xl text-white mb-2">Who are you?</h2>
                    <p className="font-exo text-sm mb-6" style={{ color:'rgba(224,232,255,0.5)' }}>Let us know who we are talking to.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block font-exo text-xs uppercase tracking-wider mb-2" style={{ color:'rgba(0,245,255,0.6)' }}>Full Name *</label>
                        <input type="text" value={form.name} onChange={e => upd('name',e.target.value)} placeholder="Ada Lovelace" className="neon-input" />
                      </div>
                      <div>
                        <label className="block font-exo text-xs uppercase tracking-wider mb-2" style={{ color:'rgba(0,245,255,0.6)' }}>Email Address *</label>
                        <input type="email" value={form.email} onChange={e => upd('email',e.target.value)} placeholder="ada@babbage.io" className="neon-input" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-8">
                      <MagneticButton variant="fill" className="text-sm py-3 px-8" onClick={next} disabled={!form.name || !form.email}>
                        Continue <ArrowRight className="w-4 h-4" />
                      </MagneticButton>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={trs}>
                    <h2 className="font-orbitron font-bold text-xl text-white mb-2">What is it about?</h2>
                    <p className="font-exo text-sm mb-6" style={{ color:'rgba(224,232,255,0.5)' }}>Select a category to help us route your message.</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {CATEGORIES.map(cat => (
                        <motion.button key={cat.value} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                          onClick={() => upd('category',cat.value)}
                          className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: form.category === cat.value ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${form.category === cat.value ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                            cursor:'none',
                          }}>
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-exo text-sm font-medium" style={{ color: form.category === cat.value ? '#00F5FF' : 'rgba(224,232,255,0.7)' }}>
                            {cat.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <div>
                      <label className="block font-exo text-xs uppercase tracking-wider mb-2 mt-4" style={{ color:'rgba(0,245,255,0.6)' }}>Subject</label>
                      <input type="text" value={form.subject} onChange={e => upd('subject',e.target.value)} placeholder="Brief description" className="neon-input" />
                    </div>
                    <div className="flex justify-between mt-8">
                      <MagneticButton variant="ghost" className="text-sm py-3 px-6" onClick={back}><ArrowLeft className="w-4 h-4" /> Back</MagneticButton>
                      <MagneticButton variant="fill" className="text-sm py-3 px-8" onClick={next} disabled={!form.category}>Continue <ArrowRight className="w-4 h-4" /></MagneticButton>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={trs}>
                    <h2 className="font-orbitron font-bold text-xl text-white mb-2">Your Message</h2>
                    <p className="font-exo text-sm mb-6" style={{ color:'rgba(224,232,255,0.5)' }}>Tell us everything. We are listening.</p>
                    <div className="mb-4">
                      <label className="block font-exo text-xs uppercase tracking-wider mb-2" style={{ color:'rgba(0,245,255,0.6)' }}>Priority</label>
                      <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                          <button key={p} onClick={() => upd('priority',p)}
                            className="flex-1 py-2 rounded-lg font-exo text-xs font-medium transition-all"
                            style={{
                              background: form.priority === p ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${form.priority === p ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                              color: form.priority === p ? '#00F5FF' : 'rgba(224,232,255,0.5)',
                              cursor:'none',
                            }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block font-exo text-xs uppercase tracking-wider mb-2" style={{ color:'rgba(0,245,255,0.6)' }}>Message *</label>
                      <textarea rows={7} value={form.message} onChange={e => upd('message',e.target.value)}
                        placeholder="Describe your question, idea, or issue..." className="neon-input resize-none" />
                      <div className="flex justify-between mt-1 font-exo text-xs" style={{ color:'rgba(224,232,255,0.3)' }}>
                        <span>Be as detailed as possible</span>
                        <span style={{ color: form.message.length > 50 ? '#00F5FF' : 'rgba(224,232,255,0.3)' }}>
                          {form.message.length} / 2000
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <MagneticButton variant="ghost" className="text-sm py-3 px-6" onClick={back}><ArrowLeft className="w-4 h-4" /> Back</MagneticButton>
                      <MagneticButton variant="fill" className="text-sm py-3 px-8" onClick={submit} disabled={!form.message || sending}>
                        {sending ? <><div className="spinner-neon w-4 h-4" />Sending...</> : <><Send className="w-4 h-4" />Send Message</>}
                      </MagneticButton>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={trs} className="text-center py-8">
                    <motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                      transition={{ type:'spring', stiffness:200, damping:15, delay:0.1 }}
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ background:'rgba(0,255,136,0.1)', border:'2px solid rgba(0,255,136,0.4)', boxShadow:'0 0 40px rgba(0,255,136,0.25)' }}>
                      <Check className="w-12 h-12" style={{ color:'#00FF88' }} />
                    </motion.div>
                    <motion.h2 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                      className="font-orbitron font-bold text-2xl text-white mb-3">Message Transmitted ✓</motion.h2>
                    <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                      className="font-exo text-sm mb-1" style={{ color:'rgba(224,232,255,0.6)' }}>
                      Your message has been sent to NeuroCradle Mission Control.
                    </motion.p>
                    <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
                      className="font-exo text-xs mb-2" style={{ color:'rgba(224,232,255,0.45)' }}>
                      A confirmation was also sent to
                    </motion.p>
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                      className="font-mono text-sm" style={{ color:'#00F5FF' }}>{form.email}</motion.span>
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
                      className="mt-8 flex items-center justify-center gap-4">
                      <MagneticButton variant="ghost" className="text-sm py-3 px-6" href="/">← Return Home</MagneticButton>
                      <MagneticButton variant="fill" className="text-sm py-3 px-6"
                        onClick={() => { setStep(0); setDir(-1); setForm({ name:'',email:'',subject:'',category:'',message:'',priority:'Medium' }) }}>
                        Send Another
                      </MagneticButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4 }}
            className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon:'⚡', label:'Fast Response', sub:'< 24 hours' },
              { icon:'🔒', label:'Encrypted', sub:'End-to-end secure' },
              { icon:'✉️', label:'Auto-reply', sub:'Instant confirmation' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl"
                style={{ background:'rgba(7,13,34,0.6)', border:'1px solid rgba(0,245,255,0.08)' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-exo text-xs font-semibold text-white">{item.label}</div>
                <div className="font-exo text-[10px] mt-0.5" style={{ color:'rgba(224,232,255,0.4)' }}>{item.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
