'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function FlowPathLine() {
  const [scrollPct, setScrollPct] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollPct(isNaN(pct) ? 0 : pct)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <>
      {/* Animated top border */}
      <div className="flow-path-line" aria-hidden="true" />
      {/* Scroll progress indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 2,
          left: 0,
          height: '2px',
          width: `${scrollPct}%`,
          background: 'linear-gradient(90deg, #00F5FF, #FF00FF, #FFE500)',
          zIndex: 1001,
          transition: 'width 0.1s ease',
          boxShadow: '0 0 10px rgba(0,245,255,0.6)',
        }}
      />
    </>
  )
}
