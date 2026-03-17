const mono = "'Share Tech Mono', monospace";
const orbitron = "'Orbitron', monospace";
const rajdhani = "'Rajdhani', sans-serif";

export default function FeedbackScreen({ data, config, onRestart }) {
  const { answers = [], role } = data || {};

  const scores = answers.map(a => a.evaluation?.score).filter(Boolean);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";

  const strengths = answers.map(a => a.evaluation?.strength).filter(Boolean);
  const improvements = answers.map(a => a.evaluation?.improvement).filter(Boolean);

  const scoreColor = (s) => {
    const n = parseFloat(s);
    if (n >= 8) return "#39ff8a";
    if (n >= 6) return "#e8a020";
    return "#ff5555";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#c8c0a8", fontFamily: rajdhani }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1c1c1c", padding: "0 32px", display: "flex", alignItems: "center", height: 56, background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: orbitron, fontSize: 14, fontWeight: 900, color: "#e8a020", letterSpacing: "0.1em" }}>CAREER<span style={{ color: "#c8c0a8" }}>PILOT</span></div>
        <div style={{ flex: 1 }} />
        <button onClick={onRestart} style={{ background: "#e8a020", color: "#080808", border: "none", fontFamily: orbitron, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", padding: "8px 16px", cursor: "pointer" }}>
          ▶ NEW INTERVIEW
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#39ff8a", letterSpacing: "0.25em", marginBottom: 8 }}>✓ INTERVIEW COMPLETE</div>
          <h1 style={{ fontFamily: orbitron, fontSize: 36, fontWeight: 900, color: "#e8e0d0", lineHeight: 1, letterSpacing: "-0.02em" }}>
            MISSION<br /><span style={{ color: "#e8a020" }}>DEBRIEF</span>
          </h1>
          <p style={{ fontFamily: mono, fontSize: 11, color: "#4a4440", marginTop: 12 }}>// {role?.toUpperCase()} · {answers.length} QUESTIONS ANSWERED</p>
        </div>

        {/* Score banner */}
        <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#1c1c1c" }}>
          {[
            { val: avgScore, label: "Overall Score", color: scoreColor(avgScore) },
            { val: answers.length, label: "Questions Answered", color: "#e8a020" },
            { val: scores.filter(s => s >= 7).length, label: "Strong Answers", color: "#39ff8a" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ background: "#0a0a0a", padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: orbitron, fontSize: 32, fontWeight: 900, color, textShadow: `0 0 20px ${color}40` }}>{val}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#4a4440", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
              <span style={{ fontFamily: mono, fontSize: 10, color: "#39ff8a", letterSpacing: "0.2em" }}>STRENGTHS IDENTIFIED</span>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#39ff8a", marginTop: 3, flexShrink: 0 }}>✓ {String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontFamily: rajdhani, fontSize: 15, color: "#c8c0a8", lineHeight: 1.5 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8a020", boxShadow: "0 0 8px #e8a020" }} />
              <span style={{ fontFamily: mono, fontSize: 10, color: "#e8a020", letterSpacing: "0.2em" }}>AREAS TO IMPROVE</span>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {improvements.map((imp, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#e8a020", marginTop: 3, flexShrink: 0 }}>▶ {String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontFamily: rajdhani, fontSize: 15, color: "#c8c0a8", lineHeight: 1.5 }}>{imp}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q&A breakdown */}
        <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 24 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a9eff", boxShadow: "0 0 8px #4a9eff" }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "#4a9eff", letterSpacing: "0.2em" }}>QUESTION BREAKDOWN</span>
          </div>
          <div>
            {answers.map((a, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < answers.length - 1 ? "1px solid #141414" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#4a4440", letterSpacing: "0.1em" }}>Q{i + 1}</div>
                  {a.evaluation?.score && (
                    <div style={{ fontFamily: orbitron, fontSize: 14, fontWeight: 700, color: scoreColor(a.evaluation.score) }}>
                      {a.evaluation.score}/10
                    </div>
                  )}
                </div>
                <p style={{ fontFamily: rajdhani, fontSize: 14, fontWeight: 600, color: "#c8c0a8", marginBottom: 8, lineHeight: 1.5 }}>{a.question}</p>
                <p style={{ fontFamily: mono, fontSize: 11, color: "#4a4440", marginBottom: 8, lineHeight: 1.7, padding: "8px 12px", background: "#111", borderLeft: "2px solid #1c1c1c" }}>
                  {a.answer}
                </p>
                {a.evaluation?.feedback && (
                  <p style={{ fontFamily: rajdhani, fontSize: 13, color: "#4a4440", lineHeight: 1.6 }}>
                    {a.evaluation.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={onRestart} style={{
            padding: 16, background: "#e8a020", color: "#080808", border: "none",
            fontFamily: orbitron, fontWeight: 700, fontSize: 11, letterSpacing: "0.15em",
            textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f0a820"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#e8a020"; e.currentTarget.style.transform = "translateY(0)"; }}>
            ▶ PRACTICE AGAIN
          </button>
          <button onClick={onRestart} style={{
            padding: 16, background: "transparent", color: "#4a4440", cursor: "pointer", transition: "all 0.2s",
            border: "1px solid #1c1c1c", fontFamily: orbitron, fontWeight: 700, fontSize: 11, letterSpacing: "0.15em",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#c8c0a8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#4a4440"; }}>
            ← DASHBOARD
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
