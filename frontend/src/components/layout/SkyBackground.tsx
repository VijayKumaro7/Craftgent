const ORBS = [
  { size: 600, x: 10,  y: 20,  color: 'rgba(99,102,241,0.12)',  delay: '0s',   duration: '12s' },
  { size: 400, x: 75,  y: 60,  color: 'rgba(168,85,247,0.10)',  delay: '3s',   duration: '15s' },
  { size: 350, x: 50,  y: 80,  color: 'rgba(6,182,212,0.08)',   delay: '6s',   duration: '10s' },
  { size: 280, x: 85,  y: 15,  color: 'rgba(99,102,241,0.07)',  delay: '1.5s', duration: '18s' },
  { size: 220, x: 20,  y: 70,  color: 'rgba(168,85,247,0.06)',  delay: '4s',   duration: '14s' },
]

export function SkyBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1e 50%,#0a0f1e 100%)' }}
      aria-hidden="true"
    >
      {/* Subtle mesh grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating ambient orbs */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  orb.size,
            height: orb.size,
            left:   `${orb.x}%`,
            top:    `${orb.y}%`,
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle at center,${orb.color},transparent 70%)`,
            animation: `orbFloat ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}

      {/* Top accent gradient */}
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{ background: 'linear-gradient(180deg,rgba(99,102,241,0.06) 0%,transparent 100%)' }}
      />
    </div>
  )
}
