'use client'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import {
  Hand, Zap, Activity, Clock, ArrowRight, TrendingUp,
  Play, Database, Cpu, Globe, BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

const sessionData = [
  { time: 'Mon', gestures: 42, duration: 12 },
  { time: 'Tue', gestures: 87, duration: 25 },
  { time: 'Wed', gestures: 31, duration: 8 },
  { time: 'Thu', gestures: 120, duration: 40 },
  { time: 'Fri', gestures: 95, duration: 30 },
  { time: 'Sat', gestures: 160, duration: 55 },
  { time: 'Sun', gestures: 78, duration: 22 },
]

const quickActions = [
  { label: 'Open Hand Lab', href: '/dashboard/hand-lab', icon: <Hand className="w-5 h-5" />, color: '#00F5FF', desc: 'Live tracking + particle effects' },
  { label: 'AI Tools Hub', href: '/dashboard/ai-tools', icon: <Zap className="w-5 h-5" />, color: '#FF00FF', desc: 'Gesture-to-code + visualizer' },
  { label: 'View Analytics', href: '/dashboard/analytics', icon: <Activity className="w-5 h-5" />, color: '#FFE500', desc: 'Session heatmaps + history' },
  { label: 'Art Gallery', href: '/dashboard/gallery', icon: <BarChart2 className="w-5 h-5" />, color: '#00FF88', desc: 'Your gesture art pieces' },
]

export default function DashboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState<{ user_metadata?: { full_name?: string } } | null>(null)
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb with Home */}
      <div className="flex items-center gap-2 mb-6 font-exo text-xs" style={{ color: 'rgba(224,232,255,0.35)' }}>
        <a href="/" style={{ color: 'rgba(0,245,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00F5FF')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,245,255,0.5)')}>
          Home
        </a>
        <span>/</span>
        <span style={{ color: 'rgba(224,232,255,0.5)' }}>Dashboard</span>
      </div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
          <span className="font-mono text-xs" style={{ color: '#00FF88' }}>SYSTEM ACTIVE</span>
        </div>
        <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.5)' }}>
          Your gesture intelligence dashboard — track, classify, create.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Sessions', value: '24', delta: '+3 this week', icon: <Database className="w-4 h-4" />, color: '#00F5FF' },
          { label: 'Gestures Tracked', value: '1,842', delta: '+160 today', icon: <Hand className="w-4 h-4" />, color: '#FF00FF' },
          { label: 'Time in Lab', value: '6.2h', delta: '+55m today', icon: <Clock className="w-4 h-4" />, color: '#FFE500' },
          { label: 'Accuracy Score', value: '97.3%', delta: '↑ 2.1%', icon: <TrendingUp className="w-4 h-4" />, color: '#00FF88' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={item}>
            <GlassCard
              className="p-4"
              glow={['cyan', 'magenta', 'yellow', 'cyan'][i] as 'cyan' | 'magenta' | 'yellow'}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: `${stat.color}12`, color: stat.color }}
                >
                  {stat.delta}
                </div>
              </div>
              <div className="font-orbitron font-bold text-2xl text-white mb-0.5">{stat.value}</div>
              <div className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.45)' }}>{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-orbitron font-semibold text-sm text-white">Weekly Activity</h3>
                <p className="font-exo text-xs mt-0.5" style={{ color: 'rgba(224,232,255,0.4)' }}>Gestures tracked per day</p>
              </div>
              <div className="flex items-center gap-3 font-exo text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded inline-block" style={{ background: '#00F5FF' }} />Gestures</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded inline-block" style={{ background: '#FF00FF' }} />Duration</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={sessionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGestures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00F5FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF00FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF00FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: 'rgba(224,232,255,0.35)', fontSize: 11, fontFamily: 'Exo 2' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(224,232,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(7,13,34,0.95)',
                    border: '1px solid rgba(0,245,255,0.2)',
                    borderRadius: 8,
                    fontFamily: 'Exo 2',
                    fontSize: 12,
                    color: '#e0e8ff',
                  }}
                />
                <Area type="monotone" dataKey="gestures" stroke="#00F5FF" strokeWidth={2} fill="url(#colorGestures)" />
                <Area type="monotone" dataKey="duration" stroke="#FF00FF" strokeWidth={2} fill="url(#colorDuration)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Gesture Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-5 h-full" glow="magenta">
            <h3 className="font-orbitron font-semibold text-sm text-white mb-4">Gesture Breakdown</h3>
            {[
              { gesture: 'Open Palm', count: 524, pct: 28, color: '#00F5FF' },
              { gesture: 'Pointing', count: 398, pct: 22, color: '#FF00FF' },
              { gesture: 'Peace', count: 356, pct: 19, color: '#FFE500' },
              { gesture: 'Pinch', count: 310, pct: 17, color: '#00FF88' },
              { gesture: 'Fist', count: 254, pct: 14, color: '#8B00FF' },
            ].map((g, i) => (
              <motion.div
                key={g.gesture}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="mb-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-exo text-xs text-white/70">{g.gesture}</span>
                  <span className="font-mono text-xs" style={{ color: g.color }}>{g.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }}
                  />
                </div>
              </motion.div>
            ))}
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron font-semibold text-sm text-white">Quick Access</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <Link href={action.href}>
                <GlassCard
                  className="p-5 cursor-pointer group"
                  glow={['cyan', 'magenta', 'yellow', 'cyan'][i] as 'cyan' | 'magenta' | 'yellow'}
                  hover={false}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${action.color}15`,
                      border: `1px solid ${action.color}25`,
                      color: action.color,
                      boxShadow: `0 0 20px ${action.color}20`,
                    }}
                  >
                    {action.icon}
                  </div>
                  <h4 className="font-orbitron font-semibold text-sm text-white mb-1">{action.label}</h4>
                  <p className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.45)' }}>{action.desc}</p>
                  <div className="flex items-center gap-1 mt-3 font-exo text-xs" style={{ color: action.color }}>
                    Launch <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
