'use client'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
  disabled?: boolean
  variant?: 'cyan' | 'magenta' | 'fill' | 'ghost'
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.4,
  onClick,
  href,
  disabled,
  variant = 'cyan',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const variantClasses = {
    cyan: 'btn-neon-cyan rounded-sm',
    magenta: 'btn-neon-magenta rounded-sm',
    fill: 'btn-glow-fill rounded-sm',
    ghost: 'border border-white/20 text-white/70 hover:text-cyan hover:border-cyan/40 font-exo font-medium px-8 py-3 transition-all duration-300',
  }

  const content = (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-block ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2 pointer-events-none">
        {children}
      </span>

      {/* Glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: variant === 'cyan'
            ? 'radial-gradient(circle at center, rgba(0,245,255,0.15), transparent 70%)'
            : variant === 'magenta'
            ? 'radial-gradient(circle at center, rgba(255,0,255,0.15), transparent 70%)'
            : 'radial-gradient(circle at center, rgba(0,245,255,0.1), transparent 70%)',
        }}
      />
    </motion.div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}
