'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { createClient } from '@/lib/supabase'
import { Download, Heart, MessageCircle, Share2, Plus, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_GALLERY = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  title: ['Digital Bloom', 'Neon Vortex', 'Cyan Web', 'Magenta Storm', 'Point Cloud', 'Elastic Grid',
    'Wave Function', 'Quantum Pulse', 'Neural Arc', 'Binary Flow', 'Fractal Hand', 'Gesture Storm'][i],
  user: ['AK', 'MR', 'JS', 'AY', 'TC', 'PK', 'NL', 'SR', 'QT', 'BF', 'FH', 'GS'][i],
  likes: [47, 31, 58, 23, 41, 66, 29, 53, 38, 44, 61, 27][i],
  color: ['#00F5FF', '#FF00FF', '#00F5FF', '#FF00FF', '#FFE500', '#8B00FF',
    '#00FF88', '#FF00FF', '#00F5FF', '#FFE500', '#8B00FF', '#00FF88'][i],
  description: ['Open palm spiral', 'Circular fist motion', 'Finger spread pattern', 'Peace + pinch combo',
    'Multi-finger pointing', 'String art composition', 'Wave gesture loop', 'Pulse pattern',
    'Arc trajectory', 'Binary signals', 'Fractal iteration', 'Storm sequence'][i],
  comments: Math.floor(Math.random() * 15),
}))

export default function GalleryPage() {
  const supabase = createClient()
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<typeof MOCK_GALLERY[0] | null>(null)
  const [comment, setComment] = useState('')
  const [filter, setFilter] = useState<'all' | 'mine' | 'top'>('all')

  const toggleLike = (id: string) => {
    setLiked(l => {
      const n = new Set(l)
      n.has(id) ? n.delete(id) : n.add(id)
      toast(n.has(id) ? '❤️ Liked!' : '💔 Unliked', { duration: 1200 })
      return n
    })
  }

  const sorted = filter === 'top'
    ? [...MOCK_GALLERY].sort((a, b) => b.likes - a.likes)
    : MOCK_GALLERY

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">Gesture Art Gallery</h1>
          <p className="font-exo text-sm mt-1" style={{ color: 'rgba(224,232,255,0.5)' }}>Canvas frames from Hand Lab sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['all', 'mine', 'top'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-md font-exo text-xs capitalize transition-all"
                style={{ background: filter === f ? 'rgba(0,245,255,0.12)' : 'transparent', color: filter === f ? '#00F5FF' : 'rgba(224,232,255,0.5)', cursor: 'none' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}>
            <GlassCard className="overflow-hidden group cursor-pointer"
              glow={item.color === '#00F5FF' ? 'cyan' : item.color === '#FF00FF' ? 'magenta' : 'yellow'}
              hover={false}
              onClick={() => setSelected(item)}>
              {/* Art preview */}
              <div className="aspect-square relative overflow-hidden"
                style={{ background: `radial-gradient(ellipse at center, ${item.color}25 0%, #050A1A 100%)` }}>
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                  {Array.from({ length: 6 }, (_, j) => {
                    const a = (j / 6) * Math.PI * 2 + (parseInt(item.id) * 0.7)
                    const r = 30 + j * 10
                    return (
                      <g key={j}>
                        <circle cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r={2 + j * 0.5}
                          fill={item.color} opacity={0.7 - j * 0.08} />
                        <line x1={100} y1={100} x2={100 + r * Math.cos(a)} y2={100 + r * Math.sin(a)}
                          stroke={item.color} strokeWidth="0.5" opacity={0.3 - j * 0.04} />
                      </g>
                    )
                  })}
                  {Array.from({ length: 4 }, (_, j) => (
                    <ellipse key={j} cx={100} cy={100} rx={20 + j * 15} ry={15 + j * 10}
                      fill="none" stroke={item.color} strokeWidth="0.4" opacity={0.2 - j * 0.04}
                      transform={`rotate(${j * 45} 100 100)`} />
                  ))}
                </svg>
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  style={{ background: 'rgba(5,10,26,0.6)', backdropFilter: 'blur(2px)' }}>
                  <span className="font-exo text-xs text-white">View Details</span>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-orbitron font-semibold text-xs text-white">{item.title}</h4>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-orbitron font-bold text-[8px] flex-shrink-0"
                    style={{ background: `${item.color}20`, color: item.color }}>{item.user}</div>
                </div>
                <p className="font-exo text-[10px] mb-2" style={{ color: 'rgba(224,232,255,0.4)' }}>{item.description}</p>
                <div className="flex items-center gap-3">
                  <button onClick={e => { e.stopPropagation(); toggleLike(item.id) }}
                    className="flex items-center gap-1 font-exo text-xs transition-colors"
                    style={{ color: liked.has(item.id) ? '#FF00FF' : 'rgba(224,232,255,0.4)', cursor: 'none' }}>
                    <motion.span animate={{ scale: liked.has(item.id) ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
                      <Heart className="w-3 h-3" fill={liked.has(item.id) ? 'currentColor' : 'none'} />
                    </motion.span>
                    {item.likes + (liked.has(item.id) ? 1 : 0)}
                  </button>
                  <div className="flex items-center gap-1 font-exo text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>
                    <MessageCircle className="w-3 h-3" />{item.comments}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <div className="relative pointer-events-auto w-full max-w-2xl rounded-2xl overflow-hidden"
                style={{ background: 'rgba(7,13,34,0.98)', border: `1px solid ${selected.color}30`, boxShadow: `0 0 60px ${selected.color}20` }}>
                <button onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(224,232,255,0.6)', cursor: 'none' }}>
                  <X className="w-4 h-4" />
                </button>

                <div className="aspect-video relative"
                  style={{ background: `radial-gradient(ellipse at center, ${selected.color}20 0%, #050A1A 100%)` }}>
                  <svg viewBox="0 0 400 225" className="absolute inset-0 w-full h-full">
                    {Array.from({ length: 10 }, (_, j) => {
                      const a = (j / 10) * Math.PI * 2 + (parseInt(selected.id) * 0.7)
                      const r = 50 + j * 15
                      return (
                        <g key={j}>
                          <circle cx={200 + r * Math.cos(a)} cy={112 + r * Math.sin(a) * 0.6} r={3 + j * 0.5}
                            fill={selected.color} opacity={0.8 - j * 0.06} />
                          <line x1={200} y1={112} x2={200 + r * Math.cos(a)} y2={112 + r * Math.sin(a) * 0.6}
                            stroke={selected.color} strokeWidth="0.8" opacity={0.4 - j * 0.03} />
                        </g>
                      )
                    })}
                  </svg>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-orbitron font-bold text-xl text-white">{selected.title}</h3>
                      <p className="font-exo text-sm mt-1" style={{ color: 'rgba(224,232,255,0.5)' }}>{selected.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleLike(selected.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-exo text-xs transition-all"
                        style={{
                          background: liked.has(selected.id) ? 'rgba(255,0,255,0.12)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${liked.has(selected.id) ? 'rgba(255,0,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          color: liked.has(selected.id) ? '#FF00FF' : 'rgba(224,232,255,0.6)',
                          cursor: 'none',
                        }}>
                        <Heart className="w-3.5 h-3.5" fill={liked.has(selected.id) ? 'currentColor' : 'none'} />
                        {selected.likes + (liked.has(selected.id) ? 1 : 0)}
                      </button>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <h4 className="font-orbitron font-semibold text-xs text-white mb-2">Technical Breakdown</h4>
                    <ul className="space-y-1.5 font-exo text-xs" style={{ color: 'rgba(224,232,255,0.5)' }}>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Tracked with 21 high-precision landmarks</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Processed via MediaPipe Handtracking Model</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Exported as a pure vector representation (SVG)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
