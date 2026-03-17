// src/components/TimerRing.jsx
export default function TimerRing({ seconds, total, size = 80, label }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

  const color = pct > 40 ? "#22c55e" : pct > 20 ? "#facc15" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="timer-ring"
        />
      </svg>
      <div className="text-center -mt-[68px]" style={{ fontFamily: "JetBrains Mono", fontSize: "1.25rem", fontWeight: 500, color }}>
        {seconds}s
      </div>
      <div style={{ marginTop: "44px", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
    </div>
  );
}
