interface EcosystemDiagramProps {
  className?: string;
}

const NODES = [
  { label: 'Founder', x: 200, y: 52 },
  { label: 'Proof', x: 346, y: 128 },
  { label: 'Customers', x: 292, y: 262 },
  { label: 'Structure', x: 108, y: 262 },
  { label: 'Investment', x: 54, y: 128 },
];

export function EcosystemDiagram({ className = '' }: EcosystemDiagramProps) {
  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-labelledby="ecosystem-title ecosystem-desc"
      className={`mx-auto block h-auto w-full max-w-[420px] ${className}`}
    >
      <title id="ecosystem-title">How FoundStep fits into a founder's journey</title>
      <desc id="ecosystem-desc">
        A founder sits at the centre, connected to proof, structure, customers and investment. Each
        step feeds the next, so progress is visible from the first idea onward.
      </desc>

      <circle cx="200" cy="160" r="128" className="fill-none stroke-border" strokeWidth="1.5" strokeDasharray="3 6" />
      <circle cx="200" cy="160" r="72" className="fill-none stroke-border" strokeWidth="1.5" />

      {NODES.map((node) => (
        <line
          key={node.label}
          x1="200"
          y1="160"
          x2={node.x}
          y2={node.y}
          className="flow-line stroke-growth"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 8"
        />
      ))}

      <circle cx="200" cy="160" r="40" className="fill-primary" />
      <text x="200" y="165" textAnchor="middle" fontSize="14" fontWeight="700" className="fill-on-solid">
        FoundStep
      </text>

      {NODES.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="30" className="fill-surface stroke-primary" strokeWidth="2" />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            className="fill-text"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
