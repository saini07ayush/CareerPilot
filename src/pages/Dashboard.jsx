// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserSessions } from "../lib/firestore";

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserSessions(user.uid)
      .then(setSessions)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [user]);

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.overallFeedback?.overallScore || 0), 0) / sessions.length)
    : null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#040806" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontFamily: "Syne", fontWeight: 800 }}>CareerPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</span>
            <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => { logout(); navigate("/"); }}>Logout</button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.75rem" }}>
            Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Track your progress and keep practicing.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Interviews", value: sessions.filter(s => s.interviewMode !== "coding").length },
            { label: "Avg Score", value: avgScore ? avgScore + "" : "—", suffix: avgScore ? "/100" : "" },
            { label: "Coding Rounds", value: sessions.filter(s => s.interviewMode === "hirevue").length },
          ].map((stat) => (
            <div key={stat.label} className="glow-card p-4 text-center">
              <div className="gradient-text" style={{ fontFamily: "JetBrains Mono", fontSize: "1.75rem", fontWeight: 700 }}>
                {stat.value}{stat.suffix || ""}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mb-8">
          <button className="btn-primary flex-1 py-4 text-base" onClick={() => navigate("/setup")}>
            + Start Interview
          </button>
          <button
            className="flex-1 py-4 rounded-lg text-base font-semibold transition-all"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "2px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              fontFamily: "Syne",
              fontWeight: 700,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
            onClick={() => navigate("/coding-setup")}
          >
            {"</>"} Coding Round
          </button>
        </div>

        {/* History */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Past Sessions</p>
          {loading ? (
            <div className="text-center py-8">
              <div className="pulse-dot mx-auto mb-3" />
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="glow-card p-8 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <p className="font-semibold mb-1" style={{ fontFamily: "Syne" }}>No sessions yet</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete your first interview to see your history here.</p>
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="glow-card p-5 mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: "Syne" }}>{s.role}</p>
                    {s.interviewMode === "hirevue" && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>HireVue</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(s.createdAt)} · {s.answers?.length || 0} questions · {s.overallFeedback?.readinessLevel}
                  </p>
                </div>
                <div className="text-right">
                  <div className="gradient-text font-mono font-bold">{s.overallFeedback?.overallScore ?? "—"}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>/ 100</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
