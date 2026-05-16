'use client'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

const weeklyData = [
  { day: 'Mon', gestures: 42, duration: 12, accuracy: 94 },
  { day: 'Tue', gestures: 87, duration: 25, accuracy: 96 },
  { day: 'Wed', gestures: 31, duration: 8, accuracy: 92 },
  { day: 'Thu', gestures: 120, duration: 40, accuracy: 98 },
  { day: 'Fri', gestures: 95, duration: 30, accuracy: 97 },
  { day: 'Sat', gestures: 160, duration: 55, accuracy: 99 },
  { day: 'Sun', gestures: 78, duration: 22, accuracy: 95 },
]

const heatData = Array.from({ length: 168 }, (_, i) => ({
  hour: i % 24,
  day: Math.floor(i / 24),
  value: Math.floor(Math.random() * 100),
}))

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('7d')

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">Analytics</h1>
          <p className="font-exo text-sm mt-1" style={{ color:'rgba(224,232,255,0.5)' }}>
            Deep dive into your hand tracking sessions
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          {(['7d','30d','90d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md font-exo text-xs font-medium transition-all"
              style={{
                background: range === r ? 'rgba(0,245,255,0.12)' : 'transparent',
                color: range === r ? '#00F5FF' : 'rgba(224,232,255,0.5)',
                cursor:'none',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Gestures', value:'1,842', delta:'+12%', color:'#00F5FF' },
          { label:'Avg Session', value:'22 min', delta:'+3 min', color:'#FF00FF' },
          { label:'Accuracy', value:'97.3%', delta:'+2.1%', color:'#FFE500' },
          { label:'Sessions', value:'24', delta:'+6 this week', color:'#00FF88' },
        ].map((k,i) => (
          <motion.div key={k.label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}>
            <GlassCard className="p-4" glow={['cyan','magenta','yellow','cyan'][i] as any}>
              <div className="font-orbitron font-bold text-2xl mb-1" style={{ color:k.color }}>{k.value}</div>
              <div className="font-exo text-xs text-white font-semibold">{k.label}</div>
              <div className="font-mono text-[10px] mt-1" style={{ color:k.color }}>{k.delta}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Area chart */}
      <GlassCard className="p-5">
        <h3 className="font-orbitron font-semibold text-sm text-white mb-4">Gesture Volume & Accuracy</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData} margin={{ top:0,right:0,left:-20,bottom:0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF00FF" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FF00FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill:'rgba(224,232,255,0.35)', fontSize:11, fontFamily:'Exo 2' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'rgba(224,232,255,0.35)', fontSize:10, fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'rgba(7,13,34,0.95)', border:'1px solid rgba(0,245,255,0.2)', borderRadius:8, fontFamily:'Exo 2', fontSize:12, color:'#e0e8ff' }}/>
            <Area type="monotone" dataKey="gestures" stroke="#00F5FF" strokeWidth={2} fill="url(#g1)" name="Gestures"/>
            <Area type="monotone" dataKey="accuracy" stroke="#FF00FF" strokeWidth={2} fill="url(#g2)" name="Accuracy %"/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard className="p-5">
        <h3 className="font-orbitron font-semibold text-sm text-white mb-4">Gesture Frequency Heatmap — Hour × Day</h3>
        <div className="overflow-x-auto">
          <div style={{ minWidth:'600px' }}>
            {days.map((day, dIdx) => (
              <div key={day} className="flex items-center gap-2 mb-1">
                <span className="font-exo text-xs w-8 text-right flex-shrink-0" style={{ color:'rgba(224,232,255,0.4)' }}>{day}</span>
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length:24 }, (_,hIdx) => {
                    const val = heatData.find(d => d.day===dIdx && d.hour===hIdx)?.value ?? 0
                    return (
                      <motion.div key={hIdx}
                        initial={{ opacity:0, scale:0.5 }}
                        animate={{ opacity:1, scale:1 }}
                        transition={{ delay:(dIdx*24+hIdx)*0.002 }}
                        className="flex-1 rounded-sm"
                        style={{
                          height:'16px',
                          background:`rgba(0,245,255,${0.05 + (val/100)*0.85})`,
                          border: val>80 ? '1px solid rgba(0,245,255,0.4)' : '1px solid transparent',
                        }}
                        title={`${day} ${hIdx}:00 — ${val} gestures`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-0.5 ml-10 mt-1">
              {Array.from({ length:24 }, (_,i) => (
                <span key={i} className="flex-1 font-mono text-center" style={{ fontSize:'8px', color:'rgba(224,232,255,0.25)' }}>
                  {i%6===0?`${i}h`:''}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="font-exo text-xs" style={{ color:'rgba(224,232,255,0.4)' }}>Less</span>
          {[0.1,0.3,0.5,0.7,0.9].map(v => (
            <div key={v} className="w-4 h-3 rounded-sm" style={{ background:`rgba(0,245,255,${v})` }}/>
          ))}
          <span className="font-exo text-xs" style={{ color:'rgba(224,232,255,0.4)' }}>More</span>
        </div>
      </GlassCard>

      {/* Bar chart */}
      <GlassCard className="p-5">
        <h3 className="font-orbitron font-semibold text-sm text-white mb-4">Session Duration by Day</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} margin={{ top:0,right:0,left:-20,bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill:'rgba(224,232,255,0.35)', fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'rgba(224,232,255,0.35)', fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'rgba(7,13,34,0.95)', border:'1px solid rgba(255,0,255,0.2)', borderRadius:8, fontFamily:'Exo 2', fontSize:12, color:'#e0e8ff' }}/>
            <Bar dataKey="duration" fill="#FF00FF" radius={[4,4,0,0]} name="Duration (min)"
              style={{ filter:'drop-shadow(0 0 6px rgba(255,0,255,0.4))' }}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  )
}
