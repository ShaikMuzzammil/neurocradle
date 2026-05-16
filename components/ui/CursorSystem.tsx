'use client'
import { useEffect, useRef, useCallback } from 'react'

interface TrailDot {
  x: number
  y: number
  alpha: number
  size: number
  hue: number
  id: number
}

export function CursorSystem() {
  const dotRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const trailContainerRef = useRef<HTMLDivElement>(null)
  const trailDotsRef = useRef<TrailDot[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const haloPos = useRef({ x: 0, y: 0 })
  const animIdRef = useRef<number>()
  const dotCountRef = useRef(0)
  const hueRef = useRef(0)

  const createTrailDot = useCallback((x: number, y: number) => {
    if (!trailContainerRef.current) return
    hueRef.current = (hueRef.current + 3) % 360

    const dot: TrailDot = {
      x, y,
      alpha: 1,
      size: Math.random() * 5 + 2,
      hue: hueRef.current,
      id: dotCountRef.current++,
    }
    trailDotsRef.current.push(dot)

    // Limit trail length
    if (trailDotsRef.current.length > 25) {
      trailDotsRef.current.shift()
    }
  }, [])

  const renderTrail = useCallback(() => {
    if (!trailContainerRef.current) return

    const container = trailContainerRef.current
    // Clear old elements
    container.innerHTML = ''

    trailDotsRef.current.forEach((dot, i) => {
      const progress = i / trailDotsRef.current.length
      const alpha = progress * 0.7
      const size = dot.size * progress

      const el = document.createElement('div')
      el.style.cssText = `
        position: absolute;
        left: ${dot.x}px;
        top: ${dot.y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${getCyberColor(dot.hue)};
        opacity: ${alpha};
        transform: translate(-50%, -50%);
        pointer-events: none;
        mix-blend-mode: screen;
        filter: blur(${(1 - progress) * 2}px);
      `
      container.appendChild(el)
    })
  }, [])

  const getCyberColor = (hue: number): string => {
    // Cycle through cyan → magenta → yellow
    const t = (hue % 120) / 120
    if (hue < 120) return `rgba(0, ${Math.floor(245 * (1-t) + 0*t)}, ${Math.floor(255 * (1-t) + 255*t)}, 1)`
    if (hue < 240) {
      const t2 = (hue - 120) / 120
      return `rgba(${Math.floor(255 * t2)}, ${Math.floor(0)}, ${Math.floor(255 * (1-t2))}, 1)`
    }
    return `rgba(255, ${Math.floor(229 * ((hue-240)/120))}, 0, 1)`
  }

  useEffect(() => {
    let lastTrailTime = 0
    let frameCount = 0

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top = e.clientY + 'px'
      }

      const now = Date.now()
      if (now - lastTrailTime > 30) {
        createTrailDot(e.clientX, e.clientY)
        lastTrailTime = now
      }
    }

    const animate = () => {
      frameCount++

      // Smooth halo follow
      const dx = mouseRef.current.x - haloPos.current.x
      const dy = mouseRef.current.y - haloPos.current.y
      haloPos.current.x += dx * 0.12
      haloPos.current.y += dy * 0.12

      if (haloRef.current) {
        haloRef.current.style.left = haloPos.current.x + 'px'
        haloRef.current.style.top = haloPos.current.y + 'px'
      }

      // Fade trail dots
      trailDotsRef.current = trailDotsRef.current.map(dot => ({
        ...dot,
        alpha: dot.alpha * 0.92,
      })).filter(dot => dot.alpha > 0.01)

      if (frameCount % 2 === 0) renderTrail()

      animIdRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    animIdRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
    }
  }, [createTrailDot, renderTrail])

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-halo" ref={haloRef} />
      <div id="cursor-trail-container" ref={trailContainerRef} />
    </>
  )
}
