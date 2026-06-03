import { useEffect, useRef } from 'react'

const AGENT_CUBES = [
  { x: 160, y: 110, color: '#7c3aed', shadow: '#4c1d95', label: 'NEXUS', delay: '0s' },
  { x: 280, y: 180, color: '#059669', shadow: '#064e3b', label: 'ALEX', delay: '0.6s' },
  { x: 110, y: 210, color: '#a78bfa', shadow: '#5b21b6', label: 'VORTEX', delay: '1.2s' },
  { x: 240, y: 80, color: '#f97316', shadow: '#7c2d12', label: 'RES', delay: '1.8s' },
]

function IsoCube({ x, y, color, shadow, label, delay }: (typeof AGENT_CUBES)[0]) {
  const s = 36
  const h = s * 0.5
  const w = s * 0.866

  const top = [
    [x, y - h],
    [x + w, y - h * 0.5],
    [x, y],
    [x - w, y - h * 0.5],
  ]
  const right = [
    [x, y],
    [x + w, y - h * 0.5],
    [x + w, y + h * 0.5],
    [x, y + h],
  ]
  const left = [
    [x, y],
    [x - w, y - h * 0.5],
    [x - w, y + h * 0.5],
    [x, y + h],
  ]

  const pts = (arr: number[][]) => arr.map(p => p.join(',')).join(' ')

  return (
    <g style={{ animation: `hero3dFloat 3s ease-in-out ${delay} infinite` }}>
      <polygon points={pts(top)} fill={color} opacity="0.9" />
      <polygon points={pts(right)} fill={shadow} opacity="0.95" />
      <polygon points={pts(left)} fill={color} opacity="0.7" />
      {/* Glow */}
      <ellipse cx={x} cy={y + h + 4} rx={w * 0.7} ry={4} fill={color} opacity="0.2" />
      <text x={x} y={y - h - 6} textAnchor="middle" fill={color} fontSize="7" fontFamily="Inter,sans-serif" fontWeight="700" opacity="0.85">
        {label}
      </text>
    </g>
  )
}

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [1, 3], [2, 3],
]

function ConnectionLines() {
  const cubePositions = AGENT_CUBES.map(c => ({ x: c.x, y: c.y }))

  return (
    <>
      {CONNECTIONS.map(([a, b], i) => {
        const p1 = cubePositions[a]
        const p2 = cubePositions[b]
        return (
          <line
            key={i}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke="#7c3aed"
            strokeWidth="0.8"
            opacity="0.3"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0" to="-16"
              dur={`${1.5 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </line>
        )
      })}
    </>
  )
}

function DataParticles() {
  const particles = [
    { cx: 160, cy: 110, r: 3, color: '#7c3aed', dur: '2s' },
    { cx: 280, cy: 180, r: 2, color: '#059669', dur: '2.4s' },
    { cx: 110, cy: 210, r: 2.5, color: '#a78bfa', dur: '3s' },
    { cx: 240, cy: 80, r: 2, color: '#f97316', dur: '1.8s' },
  ]
  return (
    <>
      {particles.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.color} opacity="0.5">
          <animate attributeName="r" values={`${p.r};${p.r * 2.5};${p.r}`} dur={p.dur} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur={p.dur} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  )
}

function OrbitRing() {
  return (
    <ellipse
      cx="195" cy="150"
      rx="130" ry="55"
      fill="none"
      stroke="url(#orbitGrad)"
      strokeWidth="0.5"
      opacity="0.4"
      strokeDasharray="6 6"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 195 150"
        to="360 195 150"
        dur="20s"
        repeatCount="indefinite"
      />
    </ellipse>
  )
}

export function Hero3DScene() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes hero3dFloat {
        0%,100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div className="relative flex-shrink-0 w-full max-w-[380px] mx-auto select-none pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 390 320"
        width="100%"
        aria-hidden="true"
        style={{ filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.15))' }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <ellipse cx="195" cy="155" rx="170" ry="130" fill="url(#bgGlow)" />

        {/* Grid lines for depth */}
        {[0, 1, 2, 3].map(i => (
          <line key={`h${i}`} x1="30" y1={80 + i * 50} x2="360" y2={80 + i * 50}
            stroke="#7c3aed" strokeWidth="0.3" opacity="0.08" />
        ))}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`v${i}`} x1={30 + i * 66} y1="60" x2={30 + i * 66} y2="280"
            stroke="#7c3aed" strokeWidth="0.3" opacity="0.08" />
        ))}

        <OrbitRing />
        <ConnectionLines />

        {AGENT_CUBES.map((cube, i) => (
          <IsoCube key={i} {...cube} />
        ))}

        <DataParticles />

        {/* Central hub ring */}
        <circle cx="195" cy="148" r="18" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="195" cy="148" r="6" fill="#7c3aed" opacity="0.7" filter="url(#glow)" />

        {/* Floating data bits */}
        {[
          { x: 60, y: 100, text: '{ }', delay: '0s' },
          { x: 320, y: 120, text: '≡', delay: '1s' },
          { x: 80, y: 260, text: '↗', delay: '0.5s' },
          { x: 330, y: 250, text: '⬡', delay: '1.5s' },
        ].map((item, i) => (
          <text
            key={i}
            x={item.x} y={item.y}
            fill="#7c3aed"
            fontSize="11"
            opacity="0.3"
            fontFamily="JetBrains Mono,monospace"
            style={{ animation: `hero3dFloat 4s ease-in-out ${item.delay} infinite` }}
          >
            {item.text}
          </text>
        ))}
      </svg>
    </div>
  )
}
