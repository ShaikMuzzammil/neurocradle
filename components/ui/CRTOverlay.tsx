'use client'

// ─── CRT Overlay ─────────────────────────────────────────────────────────────
export function CRTOverlay() {
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-flicker" />
      <div className="crt-scan-beam" />
    </div>
  )
}

// ─── Flow Path Line (nav progress indicator) ─────────────────────────────────
export function FlowPathLine() {
  return <div className="flow-path-line" aria-hidden="true" />
}
