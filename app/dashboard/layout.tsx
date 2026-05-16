'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Brain, Hand, Zap, LayoutDashboard, Activity, Image as ImageIcon, Settings,
  LogOut, Menu, X, Home, ChevronUp, ChevronDown,
  Maximize2, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'

const sidebarLinks = [
  { href: '/', label: 'Home', icon: <Home className="w-4 h-4" />, external: true },
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/hand-lab', label: 'Hand Lab', icon: <Hand className="w-4 h-4" />, badge: 'LIVE' },
  { href: '/dashboard/ai-tools', label: 'AI Tools', icon: <Zap className="w-4 h-4" />, badge: 'NEW' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> },
  { href: '/dashboard/gallery', label: 'Art Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [time, setTime] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      // Allow mock login if no active supabase session
      if (!data.user) {
        const savedName = typeof window !== 'undefined' ? localStorage.getItem('nc_mock_name') : null;
        setUser({ email: 'muzzammil160806@gmail.com', user_metadata: { full_name: savedName || 'Admin' } })
      } else {
        setUser(data.user)
      }
      setLoaded(true)
    })

    const syncProfile = () => {
      const savedName = localStorage.getItem('nc_mock_name');
      if (savedName) {
        setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: savedName } } : null);
      }
    };
    window.addEventListener('nc_profile_sync', syncProfile);

    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)

    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => { 
      clearInterval(t); 
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('nc_profile_sync', syncProfile);
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const isLinkActive = (href: string) => {
    if (href === '/') return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const currentPage = sidebarLinks.find(l => isLinkActive(l.href))?.label ?? 'Dashboard'
  const userInitial = user?.user_metadata?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'
  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'

  if (!loaded) {
    return (
      <div className="flex h-screen bg-midnight items-center justify-center">
        <div className="text-center">
          <div style={{ width: 40, height: 40, border: '2px solid rgba(0,245,255,0.2)', borderTopColor: '#00F5FF', borderRadius: '50%', animation: 'spinNeon 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p className="font-exo text-sm" style={{ color: 'rgba(0,245,255,0.6)' }}>Authenticating...</p>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo — static, no animation */}
      <div className="flex items-center gap-3 px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)' }}>
          <Brain className="w-5 h-5" style={{ color: '#00F5FF' }} />
        </div>
        {sidebarOpen && (
          <span className="font-orbitron font-bold text-sm whitespace-nowrap overflow-hidden" style={{ color: '#00F5FF' }}>
            NEURO<span style={{ color: '#FF00FF' }}>CRADLE</span>
          </span>
        )}
      </div>

      {/* Navigation — no motion wrappers that cause blink */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = isLinkActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileSidebar(false)}
              className="sidebar-link group"
              style={{
                color: isActive ? '#00F5FF' : 'rgba(224,232,255,0.55)',
                background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
                position: 'relative',
                boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 6,
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 w-0.5 h-8 rounded-r"
                  style={{ background: '#00F5FF', boxShadow: '0 0 8px #00F5FF', transform: 'translateY(-50%)' }}
                />
              )}
              <span style={{ color: isActive ? '#00F5FF' : 'rgba(224,232,255,0.4)', flexShrink: 0 }}>{link.icon}</span>
              {sidebarOpen && (
                <span className="flex-1 font-exo text-sm whitespace-nowrap overflow-hidden">{link.label}</span>
              )}
              {sidebarOpen && link.badge && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" style={{
                  background: link.badge === 'LIVE' ? 'rgba(0,255,136,0.15)' : 'rgba(255,229,0,0.15)',
                  color: link.badge === 'LIVE' ? '#00FF88' : '#FFE500',
                  border: `1px solid ${link.badge === 'LIVE' ? 'rgba(0,255,136,0.3)' : 'rgba(255,229,0,0.3)'}`,
                }}>
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* System status */}
      {sidebarOpen && (
        <div className="px-3 pb-3">
          <div className="px-3 py-3 rounded-lg" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
            <div className="font-mono text-xs mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>SYS STATUS</div>
            {[
              { label: 'ML Backend', status: 'online', color: '#00FF88' },
              { label: 'Supabase', status: 'connected', color: '#00FF88' },
              { label: 'WebSocket', status: 'ready', color: '#FFE500' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between mb-1">
                <span className="font-exo text-xs" style={{ color: 'rgba(224,232,255,0.4)' }}>{s.label}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                  <span className="font-mono text-[10px]" style={{ color: s.color }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="border-t p-3 flex-shrink-0" style={{ borderColor: 'rgba(0,245,255,0.1)' }} ref={userMenuRef}>
        {/* User dropdown popup — shown above */}
        {userMenuOpen && sidebarOpen && (
          <div
            className="mb-2 rounded-xl overflow-hidden"
            style={{ background: 'rgba(7,13,34,0.97)', border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 -12px 32px rgba(0,0,0,0.6)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,245,255,0.08)' }}>
              <div className="font-exo text-xs font-semibold text-white">{userName}</div>
              <div className="font-mono text-[10px]" style={{ color: 'rgba(0,245,255,0.5)' }}>{user?.email}</div>
            </div>
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 font-exo text-sm transition-all"
              style={{ color: 'rgba(224,232,255,0.7)', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00F5FF'; e.currentTarget.style.background = 'rgba(0,245,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(224,232,255,0.7)'; e.currentTarget.style.background = 'transparent' }}>
              <Home className="w-4 h-4" style={{ color: '#00F5FF', opacity: 0.7 }} /> Home
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-exo text-sm transition-all text-left"
              style={{ color: 'rgba(224,232,255,0.7)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}
              onClick={handleSignOut}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF00FF'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(224,232,255,0.7)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <LogOut className="w-4 h-4" style={{ color: '#FF00FF', opacity: 0.7 }} /> Sign Out
            </button>
          </div>
        )}

        <div
          className="flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200"
          style={{ background: userMenuOpen ? 'rgba(0,245,255,0.06)' : 'transparent', cursor: 'none' }}
          onClick={() => sidebarOpen && setUserMenuOpen(v => !v)}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-bold text-xs"
            style={{ background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.3)', color: '#FF00FF' }}>
            {userInitial}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-exo text-xs font-semibold text-white truncate">{userName}</div>
                <div className="font-exo text-[10px] truncate" style={{ color: 'rgba(224,232,255,0.4)' }}>{user?.email}</div>
              </div>
              {userMenuOpen
                ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00F5FF' }} />
                : <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(224,232,255,0.3)' }} />
              }
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-midnight overflow-hidden">
      {/* Desktop Sidebar — CSS transition width, no framer motion */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300"
        style={{
          width: sidebarOpen ? 240 : 64,
          background: 'rgba(5,10,26,0.98)',
          borderRight: '1px solid rgba(0,245,255,0.1)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setMobileSidebar(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-60 md:hidden flex flex-col"
            style={{ background: 'rgba(5,10,26,0.99)', borderRight: '1px solid rgba(0,245,255,0.15)' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0"
          style={{ background: 'rgba(5,10,26,0.95)', borderBottom: '1px solid rgba(0,245,255,0.08)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setMobileSidebar(true)} style={{ cursor: 'none', color: 'rgba(224,232,255,0.6)' }}>
              <Menu className="w-5 h-5" />
            </button>
            <button
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(v => !v)}
              style={{ color: 'rgba(224,232,255,0.4)', cursor: 'none', background: 'rgba(255,255,255,0.04)' }}
            >
              {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>
            <div>
              <h1 className="font-orbitron font-semibold text-sm text-white">{currentPage}</h1>
              <div className="font-mono text-[10px]" style={{ color: 'rgba(0,245,255,0.5)' }}>{time} · SYSTEM ONLINE</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-exo text-xs transition-all"
              style={{ color: 'rgba(224,232,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00F5FF'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(224,232,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              onClick={toggleFullscreen}
              style={{ color: 'rgba(224,232,255,0.5)', background: 'rgba(255,255,255,0.04)', cursor: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00F5FF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(224,232,255,0.5)' }}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
