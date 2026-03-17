import { useState } from "react";

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Data Scientist", "ML Engineer", "Full Stack Developer",
  "Product Manager", "DevOps Engineer", "Custom...",
];

const MODES = [
  { id: "foundation", label: "Foundation", desc: "Preset questions tailored to your role. Best for general prep." },
  { id: "target", label: "Target", desc: "Paste a job description for laser-focused interview questions." },
];

const mono = "'Share Tech Mono', monospace";
const orbitron = "'Orbitron', monospace";
const rajdhani = "'Rajdhani', sans-serif";

export default function RoleSelector({ user, onBack, onStart }) {
  const [role, setRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [mode, setMode] = useState("foundation");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");

  const finalRole = role === "Custom..." ? customRole : role;

  const handleStart = () => {
    if (!finalRole.trim()) { setError("Please select or enter a role."); setTimeout(() => setError(""), 3000); return; }
    if (mode === "target" && !jobDescription.trim()) { setError("Please paste a job description for Target mode."); setTimeout(() => setError(""), 3000); return; }
    onStart({ role: finalRole, mode, jobDescription });
  };

  const inputStyle = {
    width: "100%", background: "#0e0e0e", border: "1px solid #1c1c1c",
    borderLeft: "2px solid #1c1c1c", color: "#e8e0d0", fontFamily: mono,
    fontSize: 13, padding: "13px 14px", outline: "none", letterSpacing: "0.05em", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#c8c0a8", fontFamily: rajdhani, position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />
      <div style={{ position: "fixed", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(232,160,32,0.05) 0%, transparent 60%)" }} />

      <nav style={{ borderBottom: "1px solid #1c1c1c", padding: "0 32px", display: "flex", alignItems: "center", height: 56, background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: orbitron, fontSize: 14, fontWeight: 900, color: "#e8a020", letterSpacing: "0.1em", textShadow: "0 0 20px rgba(232,160,32,0.3)" }}>CAREER<span style={{ color: "#c8c0a8" }}>PILOT</span></div>
        <div style={{ flex: 1 }} />
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1c1c1c", color: "#4a4440", fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#c8c0a8"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#4a4440"; }}>← DASHBOARD</button>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 32px 100px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#e8a020", letterSpacing: "0.25em", marginBottom: 8 }}>▶ MISSION BRIEFING</div>
          <h1 style={{ fontFamily: orbitron, fontSize: 36, fontWeight: 900, color: "#e8e0d0", lineHeight: 1, letterSpacing: "-0.02em" }}>CONFIGURE<br /><span style={{ color: "#e8a020" }}>INTERVIEW</span></h1>
          <p style={{ fontFamily: mono, fontSize: 11, color: "#4a4440", marginTop: 12, lineHeight: 1.8 }}>// SELECT YOUR TARGET ROLE AND INTERVIEW MODE BELOW</p>
        </div>

        {/* Role */}
        <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8a020", boxShadow: "0 0 8px #e8a020" }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "#e8a020", letterSpacing: "0.2em" }}>TARGET ROLE</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", padding: "8px 14px", cursor: "pointer", transition: "all 0.2s",
                  border: `1px solid ${role === r ? "#e8a020" : "#1c1c1c"}`,
                  background: role === r ? "rgba(232,160,32,0.1)" : "transparent",
                  color: role === r ? "#e8a020" : "#4a4440",
                }}
                  onMouseEnter={e => { if (role !== r) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#c8c0a8"; } }}
                  onMouseLeave={e => { if (role !== r) { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#4a4440"; } }}>
                  {r}
                </button>
              ))}
            </div>
            {role === "Custom..." && (
              <input type="text" placeholder="e.g. Quantitative Analyst" value={customRole} onChange={e => setCustomRole(e.target.value)} autoFocus style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#e8a020"; e.target.style.borderLeftColor = "#e8a020"; }}
                onBlur={e => { e.target.style.borderColor = "#1c1c1c"; e.target.style.borderLeftColor = "#1c1c1c"; }} />
            )}
          </div>
        </div>

        {/* Mode */}
        <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "#39ff8a", letterSpacing: "0.2em" }}>INTERVIEW MODE</span>
          </div>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                textAlign: "left", padding: 16, cursor: "pointer", transition: "all 0.2s",
                border: `2px solid ${mode === m.id ? "#39ff8a" : "#1c1c1c"}`,
                background: mode === m.id ? "rgba(57,255,138,0.05)" : "transparent",
              }}
                onMouseEnter={e => { if (mode !== m.id) e.currentTarget.style.borderColor = "#2a2a2a"; }}
                onMouseLeave={e => { if (mode !== m.id) e.currentTarget.style.borderColor = "#1c1c1c"; }}>
                <div style={{ fontFamily: orbitron, fontSize: 12, fontWeight: 700, marginBottom: 8, color: mode === m.id ? "#39ff8a" : "#c8c0a8", letterSpacing: "0.1em" }}>
                  {mode === m.id ? "▶ " : ""}{m.label.toUpperCase()}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#4a4440", lineHeight: 1.7 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* JD */}
        {mode === "target" && (
          <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a9eff", boxShadow: "0 0 8px #4a9eff" }} />
              <span style={{ fontFamily: mono, fontSize: 10, color: "#4a9eff", letterSpacing: "0.2em" }}>JOB DESCRIPTION</span>
            </div>
            <div style={{ padding: 20 }}>
              <textarea rows={6} placeholder="Paste the job description here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                style={{ ...inputStyle, fontSize: 12, lineHeight: 1.7, resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = "#4a9eff"; e.target.style.borderLeftColor = "#4a9eff"; }}
                onBlur={e => { e.target.style.borderColor = "#1c1c1c"; e.target.style.borderLeftColor = "#1c1c1c"; }} />
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", marginTop: 8 }}>{jobDescription.split(/\s+/).filter(Boolean).length} WORDS</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontFamily: mono, fontSize: 10, color: "#ff5555", padding: "10px 12px", background: "rgba(255,85,85,0.06)", borderLeft: "2px solid #ff5555", letterSpacing: "0.05em", marginBottom: 16 }}>⚠ {error}</div>
        )}

        <button onClick={handleStart} style={{
          width: "100%", padding: 18, background: "#e8a020", color: "#080808", border: "none",
          fontFamily: orbitron, fontWeight: 700, fontSize: 13, letterSpacing: "0.15em",
          textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 30px rgba(232,160,32,0.2)",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0a820"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#e8a020"; e.currentTarget.style.transform = "translateY(0)"; }}>
          ▶ &nbsp; LAUNCH INTERVIEW
        </button>

        <div style={{ marginTop: 16, padding: "14px 16px", background: "#0a0a0a", border: "1px solid #1c1c1c", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#e8a020", marginTop: 4, flexShrink: 0 }} />
          <p style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", lineHeight: 1.8, letterSpacing: "0.05em" }}>
            QUESTIONS ARE AI-GENERATED EVERY SESSION. VOICE INPUT POWERED BY WEB SPEECH API. ANSWERS EVALUATED BY GEMINI 2.0 FLASH.
          </p>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #1c1c1c", padding: "8px 24px", display: "flex", alignItems: "center", gap: 24, zIndex: 100 }}>
        {[{ c: "#39ff8a", l: "GEMINI 2.0 FLASH" }, { c: "#39ff8a", l: "FIREBASE" }, { c: "#e8a020", l: "VOICE STANDBY" }].map(({ c, l }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em" }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c" }}>HACKANOVA 3.0 · UNPAIDINTERNS.EXE</span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
