/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050A1A',
        'midnight-2': '#070D22',
        'midnight-3': '#0A1230',
        cyan: {
          neon: '#00F5FF',
          glow: '#00D4E0',
          dim: '#006B72',
        },
        magenta: {
          neon: '#FF00FF',
          glow: '#CC00CC',
          dim: '#660066',
        },
        yellow: {
          neon: '#FFE500',
          glow: '#D4BF00',
          dim: '#665C00',
        },
        green: {
          neon: '#00FF88',
        },
        purple: {
          neon: '#8B00FF',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        exo: ['Exo 2', 'sans-serif'],
      },
      backgroundImage: {
        'grid-cyan': `
          linear-gradient(rgba(0,245,255,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.07) 1px, transparent 1px)
        `,
        'noise': "url('/noise.png')",
        'radial-glow-cyan': 'radial-gradient(circle at center, rgba(0,245,255,0.15) 0%, transparent 70%)',
        'radial-glow-magenta': 'radial-gradient(circle at center, rgba(255,0,255,0.15) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,245,255,0.25) 0%, transparent 100%)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2)',
        'neon-magenta': '0 0 20px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.2)',
        'neon-yellow': '0 0 20px rgba(255,229,0,0.5), 0 0 60px rgba(255,229,0,0.2)',
        'neon-cyan-lg': '0 0 40px rgba(0,245,255,0.6), 0 0 100px rgba(0,245,255,0.3)',
        'glass': '0 8px 32px rgba(0,245,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-hover': '0 16px 48px rgba(0,245,255,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
        'card-glow': '0 0 0 1px rgba(0,245,255,0.2), 0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'pulse-magenta': 'pulseMagenta 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'typewriter': 'typewriter 3s steps(30) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
        'rotate-slow': 'rotateSlow 30s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'particle-rise': 'particleRise 2s ease-out forwards',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,245,255,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0,245,255,0.9), 0 0 80px rgba(0,245,255,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 60px' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        particleRise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
