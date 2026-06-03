import { useEffect } from 'react'

const LAYERS = [
  { x: 60,  nodes: [80, 130, 180, 230] },
  { x: 160, nodes: [100, 155, 210] },
  { x: 260, nodes: [115, 175] },
  { x: 360, nodes: [145] },
]

const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd']

function NeuralConnections() {
  const lines: JSX.Element[] = []
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const src = LAYERS[li]
    const dst = LAYERS[li + 1]
    src.nodes.forEach((sy, si) => {
      dst.nodes.forEach((dy, di) => {
        const key = `${li}-${si}-${di}`
        const dur = `${1.5 + (si + di) * 0.2}s`
        lines.push(
          <line
            key={key}
            x1={src.x} y1={sy}
            x2={dst.x} y2={dy}
            stroke={COLORS[li]}
            strokeWidth="0.8"
            opacity="0.2"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur={dur} repeatCount="indefinite"
              begin={`${(si * 0.3 + di * 0.2).toFixed(1)}s`} />
          </line>
        )
      })
    })
  }
  return <>{lines}</>
}

function PulsingNode({ cx, cy, color, delay }: { cx: number; cy: number; color: string; delay: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill={color} opacity="0.15">
        <animate attributeName="r" values="8;12;8" dur="2.5s" begin={delay} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2.5s" begin={delay} repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="5" fill={color} opacity="0.7" />
      <circle cx={cx} cy={cy} r="2" fill="#ffffff" opacity="0.9" />
    </g>
  )
}

export function NeuralNet3D() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes neuralFloat {
        0%,100% { transform: translateY(0) rotateX(0deg); }
        50%      { transform: translateY(-6px) rotateX(2deg); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div
      className="mx-auto mb-8 select-none pointer-events-none"
      style={{
        width: 420,
        maxWidth: '100%',
        perspective: '600px',
        animation: 'neuralFloat 5s ease-in-out infinite',
      }}
    >
      <svg viewBox="0 0 420 310" width="100%" aria-hidden="true"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(124,58,237,0.2))' }}>
        <defs>
          <radialGradient id="nnBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <filter id="nnGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="420" height="310" rx="16" fill="url(#nnBg)" />
        <rect x="0" y="0" width="420" height="310" rx="16" fill="none"
          stroke="#7c3aed" strokeWidth="0.5" opacity="0.2" />

        <NeuralConnections />

        {LAYERS.map((layer, li) =>
          layer.nodes.map((y, ni) => (
            <PulsingNode
              key={`${li}-${ni}`}
              cx={layer.x}
              cy={y}
              color={COLORS[li]}
              delay={`${(li * 0.4 + ni * 0.3).toFixed(1)}s`}
            />
          ))
        )}

        {/* Layer labels */}
        {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, i) => (
          <text
            key={i}
            x={LAYERS[i].x}
            y={270}
            textAnchor="middle"
            fill={COLORS[i]}
            fontSize="9"
            fontFamily="Inter,sans-serif"
            opacity="0.5"
          >
            {label}
          </text>
        ))}

        {/* Traveling signal dots */}
        {[[0, 1], [1, 2], [2, 3]].map(([li], i) => {
          const src = LAYERS[li]
          const dst = LAYERS[li + 1]
          const sy = src.nodes[0]
          const dy = dst.nodes[0]
          return (
            <circle key={i} r="3" fill="#a78bfa" opacity="0.8" filter="url(#nnGlow)">
              <animateMotion
                dur={`${2 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.7}s`}
                path={`M ${src.x} ${sy} L ${dst.x} ${dy}`}
              />
            </circle>
          )
        })}
      </svg>
    </div>
  )
}
