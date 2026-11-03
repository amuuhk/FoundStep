export function SystemDiagram() {
  return (
    <svg viewBox="0 0 400 320" className="h-auto w-full" role="img" aria-label="Diagram of a startup moving from idea to production to investment">
      <g fill="none" stroke="#1d3a66" strokeWidth="1">
        <circle cx="200" cy="160" r="60" />
        <circle cx="200" cy="160" r="110" strokeDasharray="2 6" />
        <circle cx="200" cy="160" r="150" />
      </g>

      <path
        d="M70 250 C 130 250, 150 160, 200 160 S 270 70, 330 70"
        fill="none"
        stroke="#00c896"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 10"
        className="flow-line"
      />

      <circle cx="70" cy="250" r="14" fill="#1d3a66" stroke="#00c896" strokeWidth="2" />

      <circle cx="200" cy="160" r="16" fill="#00c896" />
      <circle cx="200" cy="160" r="16" fill="none" stroke="#00c896" strokeWidth="1">
        <animate attributeName="r" values="16;30;16" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
      </circle>

      <circle cx="330" cy="70" r="20" fill="#ffffff" />
      <circle cx="330" cy="70" r="6" fill="#0a1931" />

      <g fontSize="13" fontWeight="600" textAnchor="middle" fill="#c7d6ea">
        <text x="70" y="289">Idea</text>
        <text x="200" y="200">Production</text>
        <text x="330" y="32">Investment</text>
      </g>
    </svg>
  );
}
