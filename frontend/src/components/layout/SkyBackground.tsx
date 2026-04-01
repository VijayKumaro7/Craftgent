/**
 * SkyBackground — the Minecraft world behind the UI panels.
 * Renders drifting pixel clouds and a grass/dirt ground strip.
 * Pure CSS — no canvas, no JS needed.
 */

const CLOUDS = [
  { top: 12,  delay: 0,   duration: 32, scale: 1.0 },
  { top: 28,  delay: -10, duration: 45, scale: 0.7 },
  { top: 8,   delay: -22, duration: 38, scale: 1.2 },
  { top: 40,  delay: -5,  duration: 52, scale: 0.8 },
  { top: 18,  delay: -30, duration: 41, scale: 0.9 },
]

function Cloud({ top, delay, duration, scale }: typeof CLOUDS[0]) {
  const w = 96 * scale
  const h = 32 * scale

  return (
    <div
      className="absolute"
      style={{
        top,
        width: w,
        height: h,
        animation: `cloudDrift ${duration}s linear ${delay}s infinite`,
      }}
    >
      {/* Main body */}
      <div className="absolute bg-white" style={{ left: 0, top: h * 0.4, width: '100%', height: h * 0.6 }} />
      {/* Top bumps */}
      <div className="absolute bg-white" style={{ left: '10%', top: 0, width: '45%', height: h * 0.55 }} />
      <div className="absolute bg-white" style={{ left: '40%', top: h * 0.1, width: '40%', height: h * 0.45 }} />
    </div>
  )
}

export function SkyBackground() {
  return (
    <>
      {/* Sky */}
      <div
        className="fixed inset-0 sky-gradient"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Clouds */}
      <div
        className="fixed top-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: 120, zIndex: 1 }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes cloudDrift {
            from { transform: translateX(-200px); }
            to   { transform: translateX(110vw);  }
          }
        `}</style>
        {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}
      </div>

      {/* Ground — grass + dirt strip at the very bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      >
        <div style={{ height: 16, background: '#5d9e32', borderTop: '4px solid #6abf38' }} />
        <div
          style={{
            height: 32,
            background: 'repeating-linear-gradient(0deg,#5c3d1e 0,#5c3d1e 2px,#866043 2px,#866043 14px)',
          }}
        />
      </div>
    </>
  )
}
