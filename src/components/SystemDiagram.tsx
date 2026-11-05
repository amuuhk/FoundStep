export function SystemDiagram() {
  return (
    <svg viewBox="0 0 400 320" className="h-auto w-full text-primary" role="img" aria-label="Diagram of a startup moving from idea to production to investment">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="200" cy="160" r="60" />
        <circle cx="200" cy="160" r="110" strokeDasharray="2 6" />
        <circle cx="200" cy="160" r="150" />
      </g>

      <path
        d="M70 250 C 130 250, 150 160, 200 160 S 270 70, 330 70"
        fill="none"
        className="flow-line stroke-growth"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 10"
      />

      <circle cx="70" cy="250" r="14" className="fill-primary stroke-growth" strokeWidth="2" />

      <circle cx="200" cy="160" r="16" className="fill-growth" />
      <circle cx="200" cy="160" r="16" fill="none" className="stroke-growth" strokeWidth="1">
        <animate attributeName="r" values="16;30;16" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
      </circle>

      <circle cx="330" cy="70" r="20" className="fill-surface" />
      <circle cx="330" cy="70" r="6" className="fill-text" />

      <g fontSize="13" fontWeight="600" textAnchor="middle" className="fill-muted">
        <text x="70" y="289">Idea</text>
        <text x="200" y="200">Production</text>
        <text x="330" y="32">Investment</text>
      </g>
    </svg>
  );
}
