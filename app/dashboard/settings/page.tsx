'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { User, Bell, Shield, Palette, Save, Camera } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', bio: '', website: '', github: '', twitter: '' })
  const [saving, setSaving] = useState(false)
  const [notifs, setNotifs] = useState({ email: true, weekly: false, realtime: true })
  const [activeTab, setActiveTab] = useState('profile')
  const [accentColor, setAccentColor] = useState('#00F5FF')
  const [crtIntensity, setCrtIntensity] = useState(30)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setProfile({ full_name: data.user.user_metadata?.full_name || 'Admin', bio: 'AI Enthusiast & Developer', website: '', github: '', twitter: '' })
      } else {
        const savedName = typeof window !== 'undefined' ? localStorage.getItem('nc_mock_name') : null;
        setProfile({ full_name: savedName || 'Admin', bio: 'AI Enthusiast & Developer', website: '', github: '', twitter: '' })
      }
    })
  }, [])

  const save = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      if (typeof window !== 'undefined' && profile.full_name) {
        localStorage.setItem('nc_mock_name', profile.full_name);
        window.dispatchEvent(new Event('nc_profile_sync'));
      }
      toast.success('Profile saved successfully!')
    }, 600)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ]

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-orbitron font-bold text-2xl text-white mb-1">Settings</h1>
        <p className="font-exo text-sm" style={{ color: 'rgba(224,232,255,0.5)' }}>Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-exo text-sm transition-all text-left"
                style={{
                  background: activeTab === tab.id ? 'rgba(0,245,255,0.08)' : 'transparent',
                  color: activeTab === tab.id ? '#00F5FF' : 'rgba(224,232,255,0.55)',
                  borderLeft: activeTab === tab.id ? '2px solid #00F5FF' : '2px solid transparent',
                  cursor: 'none',
                }}>
                <span style={{ color: activeTab === tab.id ? '#00F5FF' : 'rgba(224,232,255,0.35)' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="p-6">
                <h2 className="font-orbitron font-semibold text-base text-white mb-6">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center font-orbitron font-bold text-2xl"
                      style={{ background: 'rgba(255,0,255,0.15)', border: '2px solid rgba(255,0,255,0.35)', color: '#FF00FF' }}>
                      {profile.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div>
                    <div className="font-exo font-semibold text-white">{profile.full_name || 'Admin'}</div>
                    <div className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>{user?.email || 'muzzammil160806@gmail.com'}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'full_name', label: 'Full Name', placeholder: 'Ada Lovelace' },
                    { key: 'bio', label: 'Bio', placeholder: 'ML engineer & creative coder' },
                    { key: 'website', label: 'Website', placeholder: 'https://yoursite.dev' },
                    { key: 'github', label: 'GitHub', placeholder: 'username' },
                    { key: 'twitter', label: 'Twitter / X', placeholder: '@handle' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block font-exo text-xs uppercase tracking-wider mb-2" style={{ color: 'rgba(0,245,255,0.6)' }}>{f.label}</label>
                      <input type="text" value={profile[f.key as keyof typeof profile]}
                        onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="neon-input" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <MagneticButton variant="fill" className="text-sm py-2.5 px-6" onClick={save} disabled={saving}>
                    {saving ? <div className="spinner-neon w-4 h-4" /> : <><Save className="w-4 h-4" />Save Changes</>}
                  </MagneticButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="p-6">
                <h2 className="font-orbitron font-semibold text-base text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'weekly', label: 'Weekly Digest', desc: 'Weekly summary of your activity' },
                    { key: 'realtime', label: 'Real-time Alerts', desc: 'Live gesture and session alerts' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div>
                        <div className="font-exo text-sm font-semibold text-white">{n.label}</div>
                        <div className="font-exo text-xs mt-0.5" style={{ color: 'rgba(224,232,255,0.45)' }}>{n.desc}</div>
                      </div>
                      <button onClick={() => {
                          setNotifs(s => ({ ...s, [n.key]: !s[n.key as keyof typeof s] }))
                          toast.success(`${n.label} ${!notifs[n.key as keyof typeof notifs] ? 'enabled' : 'disabled'}`)
                        }}
                        className="relative w-11 h-6 rounded-full transition-all duration-300"
                        style={{
                          background: notifs[n.key as keyof typeof notifs] ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${notifs[n.key as keyof typeof notifs] ? '#00F5FF' : 'rgba(255,255,255,0.15)'}`,
                          cursor: 'none',
                        }}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                          style={{
                            left: notifs[n.key as keyof typeof notifs] ? 'calc(100% - 22px)' : '2px',
                            background: notifs[n.key as keyof typeof notifs] ? '#00F5FF' : 'rgba(224,232,255,0.4)',
                            boxShadow: notifs[n.key as keyof typeof notifs] ? '0 0 8px #00F5FF' : 'none',
                          }} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="p-6">
                <h2 className="font-orbitron font-semibold text-base text-white mb-6">Security</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                    <div className="font-exo text-sm font-semibold text-white mb-1">Connected Account</div>
                    <div className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.5)' }}>{user?.email}</div>
                    <div className="font-mono text-[10px] mt-1" style={{ color: '#00FF88' }}>
                      ✓ Verified — {user?.app_metadata?.provider || 'email'}
                    </div>
                  </div>
                  <MagneticButton variant="magenta" className="text-xs py-2 px-5" onClick={() => toast.success('Password reset email sent!')}>
                    Change Password
                  </MagneticButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="p-6">
                <h2 className="font-orbitron font-semibold text-base text-white mb-6">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-exo text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(0,245,255,0.6)' }}>Accent Color</label>
                    <div className="flex gap-3">
                      {['#00F5FF', '#FF00FF', '#FFE500', '#00FF88', '#8B00FF'].map(c => (
                        <button key={c} onClick={() => { setAccentColor(c); toast.success('Accent color updated'); document.documentElement.style.setProperty('--cyan', c) }}
                          className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                          style={{ background: c, borderColor: accentColor === c ? '#FFF' : 'rgba(255,255,255,0.2)', cursor: 'none', boxShadow: `0 0 12px ${c}60` }}>
                          {accentColor === c && <div className="w-3 h-3 bg-white rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-exo text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(0,245,255,0.6)' }}>CRT Intensity: {crtIntensity}%</label>
                    <input type="range" min="0" max="100" value={crtIntensity} onChange={e => { setCrtIntensity(Number(e.target.value)) }}
                      onMouseUp={() => toast.success('Intensity saved')}
                      className="w-full" style={{ accentColor, cursor: 'none' }} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
