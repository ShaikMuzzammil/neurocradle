'use client'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'magenta' | 'yellow' | 'none'
  border?: boolean
  hover?: boolean
}

export function GlassCard({
  children,
  className = '',
  glow = 'cyan',
  border = true,
  hover = true,
  ...motionProps
}: GlassCardProps) {
  const glowColors = {
    cyan: 'rgba(0,245,255,',
    magenta: 'rgba(255,0,255,',
    yellow: 'rgba(255,229,0,',
    none: 'rgba(0,0,0,',
  }

  const gc = glowColors[glow]

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        background: 'rgba(7, 13, 34, 0.7)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: border ? `1px solid ${gc}0.15)` : 'none',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${gc}0.08)`,
      }}
      whileHover={hover ? {
        borderColor: `${gc}0.35)`,
        boxShadow: `0 8px 40px ${gc}0.12), 0 0 0 1px ${gc}0.25), 0 0 60px ${gc}0.06)`,
        y: -2,
      } : undefined}
      transition={{ duration: 0.3 }}
      {...motionProps}
    >
      {/* Corner accents */}
      {border && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
            style={{
              borderTop: `1px solid ${gc}0.6)`,
              borderLeft: `1px solid ${gc}0.6)`,
            }}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
            style={{
              borderTop: `1px solid ${gc}0.6)`,
              borderRight: `1px solid ${gc}0.6)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none"
            style={{
              borderBottom: `1px solid ${gc}0.6)`,
              borderLeft: `1px solid ${gc}0.6)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
            style={{
              borderBottom: `1px solid ${gc}0.6)`,
              borderRight: `1px solid ${gc}0.6)`,
            }}
          />
        </>
      )}
      {children}
    </motion.div>
  )
}
