import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import ParticleBackground from "./ParticleBackground";

const tips = [
  { title: "Use the STAR method", body: "Structure behavioral answers: Situation, Task, Action, Result." },
  { title: "Pause before answering", body: "Taking 2-3 seconds shows thoughtfulness, not weakness." },
  { title: "Ask clarifying questions", body: "Real interviews reward candidates who clarify before diving in." },
  { title: "Quantify your impact", body: "Numbers make answers memorable. 'Improved by 40%' beats 'improved a lot'." },
  { title: "Mirror the interviewer's language", body: "Use their exact terminology — it signals cultural fit." },
  { title: "End with confidence", body: "Always close with 'Is there anything I can elaborate on?'" },
];

export default function Dashboard({ user, onLogout, onStartInterview }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "interviews"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("History fetch failed:", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  const avgScore = history.length
    ? (history.reduce((a, b) => a + (b.overallScore || 0), 0) / history.length).toFixed(1)
    : "—";

  const mono = "'Share Tech Mono', monospace";
  const orbitron = "'Orbitron', monospace";
  const rajdhani = "'Rajdhani', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#c8c0a8", fontFamily: rajdhani, position: "relative" }}>
      <ParticleBackground />
      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />

      {/* Top nav */}
      <nav style={{ borderBottom: "1px solid #1c1c1c", padding: "0 32px", display: "flex", alignItems: "center", height: 56, background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: orbitron, fontSize: 14, fontWeight: 900, color: "#e8a020", letterSpacing: "0.1em", textShadow: "0 0 20px rgba(232,160,32,0.3)" }}>
          CAREER<span style={{ color: "#c8c0a8" }}>PILOT</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1c1c1c", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: orbitron, fontSize: 14, color: "#e8a020" }}>
              {user?.displayName?.[0]?.toUpperCase() || "P"}
            </div>
            <span style={{ fontFamily: mono, fontSize: 14, color: "#ffffff", letterSpacing: "0.1em" }}>
              {user?.displayName || user?.email?.split("@")[0] || "PILOT"}
            </span>
          </div>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid #1c1c1c", color: "#4a4440",
            fontFamily: mono, fontSize: 14, letterSpacing: "0.1em", padding: "6px 12px",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#b3b3b3"; e.currentTarget.style.color = "#ff5555"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#bebebe"; e.currentTarget.style.color = "#bfbfbf"; }}>
            LOGOUT
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 100px" }}>

        {/* Welcome + CTA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, marginBottom: 40, alignItems: "end" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 14, color: "#e8a020", letterSpacing: "0.25em", marginBottom: 8 }}>
              ▶ WELCOME BACK, {(user?.displayName || "PILOT").toUpperCase()}
            </div>
            <h1 style={{ fontFamily: orbitron, fontSize: 36, fontWeight: 900, color: "#e8e0d0", lineHeight: 1, letterSpacing: "-0.02em" }}>
              MISSION<br /><span style={{ color: "#e8a020" }}>CONTROL</span>
            </h1>
            <p style={{ fontFamily: mono, fontSize: 14, color: "bfbfbf", marginTop: 12, lineHeight: 1.8 }}>
              // READY TO SIMULATE YOUR NEXT INTERVIEW?
            </p>
          </div>
          <button onClick={onStartInterview}
            style={{
              background: "#e8a020", color: "#080808", border: "none",
              fontFamily: orbitron, fontWeight: 700, fontSize: 13, letterSpacing: "0.15em",
              padding: "20px 40px", cursor: "pointer", transition: "all 0.2s",
              textTransform: "uppercase", whiteSpace: "nowrap",
              boxShadow: "0 0 30px rgba(232,160,32,0.2)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f0a820"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 30px rgba(232,160,32,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#e8a020"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(232,160,32,0.2)"; }}>
            ▶ &nbsp; START INTERVIEW
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#1c1c1c", border: "1px solid #1c1c1c", marginBottom: 32 }}>
          {[
            { val: history.length || "0", label: "Total Interviews" },
            { val: avgScore, label: "Avg Score" },
            { val: history.length ? `${history[0]?.role || "—"}` : "—", label: "Last Role" },
            { val: history.length ? new Date(history[0]?.createdAt?.toDate()).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—", label: "Last Session" },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: "#0a0a0a", padding: "20px 24px" }}>
              <div style={{ fontFamily: orbitron, fontSize: 26, fontWeight: 700, color: "#bebebe", textShadow: "0 0 15px rgba(232,160,32,0.2)" }}>{val}</div>
              <div style={{ fontFamily: mono, fontSize: 14, color: "#bebebe", letterSpacing: "0.15em", marginTop: 6, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>

          {/* Interview history */}
          <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
              <span style={{ fontFamily: mono, fontSize: 14, color: "#39ff8a", letterSpacing: "0.2em" }}>INTERVIEW LOG</span>
            </div>

            {loadingHistory ? (
              <div style={{ padding: 32, fontFamily: mono, fontSize: 14, color: "#2a2a2a", letterSpacing: "0.1em", textAlign: "center" }}>
                LOADING LOG...
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div style={{ fontFamily: orbitron, fontSize: 32, color: "#bebebe", marginBottom: 12 }}>—</div>
                <div style={{ fontFamily: mono, fontSize: 14, color: "#bebebe", letterSpacing: "0.1em" }}>NO INTERVIEWS YET</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#bebebe", marginTop: 8 }}>START YOUR FIRST SESSION ABOVE</div>
              </div>
            ) : (
              <div>
                {history.map((item, i) => (
                  <div key={item.id} style={{
                    padding: "16px 24px", borderBottom: i < history.length - 1 ? "1px solid #141414" : "none",
                    display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                    transition: "background 0.2s", cursor: "default",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#111"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <div style={{ fontFamily: rajdhani, fontSize: 15, fontWeight: 600, color: "#c8c0a8", letterSpacing: "0.05em" }}>
                        {item.role}
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: "#4a4440", marginTop: 4, letterSpacing: "0.1em" }}>
                        {item.mode?.toUpperCase()} · {item.questionCount || "?"} QUESTIONS · {item.createdAt?.toDate
                          ? new Date(item.createdAt.toDate()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: orbitron, fontSize: 20, fontWeight: 700, color: item.overallScore >= 7 ? "#39ff8a" : item.overallScore >= 5 ? "#e8a020" : "#ff5555" }}>
                        {item.overallScore || "—"}
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 8, color: "#4a4440", letterSpacing: "0.1em" }}>/ 10</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Tip of the day */}
            <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8a020", boxShadow: "0 0 8px #e8a020", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: mono, fontSize: 10, color: "#e8a020", letterSpacing: "0.2em" }}>PILOT TIPS</span>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontFamily: rajdhani, fontSize: 15, fontWeight: 600, color: "#c8c0a8", marginBottom: 8 }}>
                  {tips[tipIndex].title}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#d3d3d3", lineHeight: 1.8 }}>
                  {tips[tipIndex].body}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                  {tips.map((_, i) => (
                    <div key={i} onClick={() => setTipIndex(i)} style={{
                      width: i === tipIndex ? 16 : 6, height: 6,
                      background: i === tipIndex ? "#e8a020" : "#bebebe",
                      cursor: "pointer", transition: "all 0.3s",
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick roles */}
            <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a9eff", boxShadow: "0 0 8px #4a9eff" }} />
                <span style={{ fontFamily: mono, fontSize: 10, color: "#4a9eff", letterSpacing: "0.2em" }}>QUICK START</span>
              </div>
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["SWE", "PM", "Data Analyst", "Designer", "DevOps", "ML Engineer"].map(role => (
                  <button key={role} onClick={onStartInterview}
                    style={{
                      background: "transparent", border: "1px solid #1c1c1c", color: "#4a4440",
                      fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", padding: "10px 8px",
                      cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8a020"; e.currentTarget.style.color = "#e8a020"; e.currentTarget.style.background = "rgba(232,160,32,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#4a4440"; e.currentTarget.style.background = "transparent"; }}>
                    ▶ {role}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Status strip */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #1c1c1c", padding: "8px 24px", display: "flex", alignItems: "center", gap: 24, zIndex: 100 }}>
        {[{ c: "#39ff8a", l: "GEMINI 2.0 FLASH" }, { c: "#39ff8a", l: "FIREBASE" }, { c: "#e8a020", l: "VOICE STANDBY" }].map(({ c, l }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em" }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c" }}>Shutdown LinkedIn </span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
