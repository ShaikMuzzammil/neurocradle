'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { MagneticButton } from './MagneticButton'
import {
  Brain, Menu, X, Mail, LayoutDashboard, ChevronDown,
} from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/', section: 'hero', icon: null },
  { label: 'Features', href: '/#features', section: 'features', icon: null },
  { label: 'Platform', href: '/dashboard', section: 'platform', icon: <ChevronDown className="w-3 h-3" /> },
  { label: 'Contact', href: '/contact', section: 'contact', icon: <Mail className="w-4 h-4" /> },
]

export function NavBar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [platformHover, setPlatformHover] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)

      // Section-based highlighting on home page
      if (pathname === '/') {
        const sections = [
          { id: 'features', label: 'features' },
          { id: 'demo', label: 'demo' },
          { id: 'cta', label: 'cta' },
        ]
        let current = 'hero'
        for (const s of sections) {
          const el = document.getElementById(s.id)
          if (el && window.scrollY + 100 >= el.offsetTop) current = s.label
        }
        setActiveSection(current)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const getNavActive = (item: typeof navItems[0]) => {
    if (item.href === '/') return pathname === '/' && activeSection === 'hero'
    if (item.href === '/#features') return pathname === '/' && activeSection === 'features'
    if (item.href === '/dashboard') return pathname.startsWith('/dashboard')
    if (item.href === '/contact') return pathname === '/contact'
    return false
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div
        className="rounded-xl px-6 py-3 flex items-center gap-6 transition-all duration-500 w-full max-w-5xl"
        style={{
          background: scrolled ? 'rgba(5, 10, 26, 0.95)' : 'rgba(5, 10, 26, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0,245,255,0.15)',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,245,255,0.1)'
            : '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-8 h-8">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.25), transparent)' }}
            />
            <Brain
              className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300"
              style={{ color: '#00F5FF', filter: 'drop-shadow(0 0 6px #00F5FF)' }}
            />
          </div>
          <span
            className="font-orbitron font-bold text-lg tracking-wider"
            style={{ color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.5)' }}
          >
            NEURO<span style={{ color: '#FF00FF' }}>CRADLE</span>
          </span>
        </Link>

        {/* Desktop Nav — centered */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = getNavActive(item)

            if (item.label === 'Platform') {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setPlatformHover(true)}
                  onMouseLeave={() => setPlatformHover(false)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-exo text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? '#00F5FF' : 'rgba(224,232,255,0.7)',
                      background: isActive ? 'rgba(0,245,255,0.1)' : 'transparent',
                      boxShadow: isActive ? '0 0 15px rgba(0,245,255,0.2)' : 'none',
                    }}
                  >
                    {item.label}
                    <ChevronDown className="w-3 h-3" style={{ transform: platformHover ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </Link>
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: '#00F5FF', boxShadow: '0 0 8px #00F5FF' }}
                    />
                  )}
                  <AnimatePresence>
                    {platformHover && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-48 rounded-xl overflow-hidden"
                        style={{
                          background: 'rgba(7, 13, 34, 0.97)',
                          border: '1px solid rgba(0,245,255,0.2)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,245,255,0.1)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 font-exo text-sm transition-all duration-200"
                          style={{ color: 'rgba(224,232,255,0.7)', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#00F5FF'; e.currentTarget.style.background = 'rgba(0,245,255,0.06)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(224,232,255,0.7)'; e.currentTarget.style.background = 'transparent' }}
                        >
                          <LayoutDashboard className="w-4 h-4" style={{ color: '#00F5FF', opacity: 0.7 }} />
                          Dashboard
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 rounded-lg font-exo text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#00F5FF' : 'rgba(224,232,255,0.7)',
                  background: isActive ? 'rgba(0,245,255,0.1)' : 'transparent',
                  boxShadow: isActive ? '0 0 15px rgba(0,245,255,0.2)' : 'none',
                  textShadow: isActive ? '0 0 8px rgba(0,245,255,0.6)' : 'none',
                }}
              >
                {item.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: '#00F5FF', boxShadow: '0 0 8px #00F5FF' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/login"
            className="font-exo text-sm transition-colors duration-200 px-3 py-2"
            style={{ color: 'rgba(224,232,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00F5FF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(224,232,255,0.6)')}
          >
            Sign In
          </Link>
          <MagneticButton variant="cyan" className="text-xs py-2 px-5" href="/login">
            Launch App
          </MagneticButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white/70 hover:text-cyan-neon transition-colors p-2 ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ cursor: 'none' }}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 rounded-xl overflow-hidden w-full max-w-5xl"
            style={{
              background: 'rgba(5, 10, 26, 0.97)',
              border: '1px solid rgba(0,245,255,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-4 flex flex-col gap-1">
              {navItems.map((item, i) => {
                const isActive = getNavActive(item)
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-2.5 rounded-lg font-exo text-sm"
                      style={{
                        color: isActive ? '#00F5FF' : 'rgba(224,232,255,0.7)',
                        background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
                        boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.15)' : 'none',
                      }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
              <div className="pt-2 border-t border-white/10 flex gap-2 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 font-exo text-sm border border-cyan-neon/30 rounded-lg"
                  style={{ color: '#00F5FF', borderColor: 'rgba(0,245,255,0.3)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 font-exo text-sm rounded-lg font-semibold"
                  style={{ background: '#00F5FF', color: '#050A1A' }}
                >
                  Launch App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
