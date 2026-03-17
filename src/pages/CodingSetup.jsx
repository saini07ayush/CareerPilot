// src/pages/CodingSetup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TOTAL_QUESTIONS, getTopicsForDifficulty } from "../lib/questionBank";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const LANGUAGES = ["python", "javascript", "cpp", "java"];
const LANGUAGE_LABELS = {
  python: "Python 3",
  javascript: "JavaScript",
  cpp: "C++ (GCC)",
  java: "Java",
};
const TOPICS = [
  "Any", "Arrays", "Strings", "Linked Lists", "Trees", "Graphs",
  "Dynamic Programming", "Sorting & Searching", "HashMaps",
  "Stacks & Queues", "Recursion & Backtracking", "Greedy",
];

const DIFF_COLORS = {
  Easy:   { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  text: "#22c55e" },
  Medium: { bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", text: "#facc15" },
  Hard:   { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  text: "#ef4444" },
};

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Data Scientist", "ML Engineer", "Full Stack Developer", "Custom..."
];

export default function CodingSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("python");
  const [topic, setTopic] = useState("Any");
  const [role, setRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");

  const topics = getTopicsForDifficulty(difficulty);
  const finalRole = role === "Custom..." ? customRole : role;

  const handleStart = () => {
    if (!finalRole.trim()) return;
    navigate("/coding", {
      state: {
        role: finalRole,
        difficulty,
        language,
        topic: topic === "Any" ? null : topic,
        standalone: true,
      },
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-xl mx-auto page-enter">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#040806" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.1rem" }}>CareerPilot</span>
          </div>
          <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "Syne" }}>
              Coding Round
            </span>
          </div>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "2rem", marginBottom: "0.4rem" }}>
            DSA Challenge
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Configure your coding interview. Pick from {TOTAL_QUESTIONS}+ curated problems — no wait, instant load.
          </p>
        </div>

        {/* Role */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Target Role
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  border: `1px solid ${role === r ? "var(--accent)" : "var(--border)"}`,
                  background: role === r ? "var(--accent-glow)" : "transparent",
                  color: role === r ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {role === "Custom..." && (
            <input
              className="input-field mt-1"
              placeholder="Enter your target role..."
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              autoFocus
            />
          )}
        </div>

        {/* Difficulty */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            Difficulty
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => {
              const c = DIFF_COLORS[d];
              const descriptions = {
                Easy: "Basic DS, simple loops, O(n) solutions",
                Medium: "Requires insight, 1-2 key observations",
                Hard: "Complex algorithms, DP, advanced graphs",
              };
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="text-left p-4 rounded-lg transition-all"
                  style={{
                    border: `2px solid ${difficulty === d ? c.border : "var(--border)"}`,
                    background: difficulty === d ? c.bg : "var(--bg-secondary)",
                  }}
                >
                  <div className="font-semibold text-sm mb-1" style={{ fontFamily: "Syne", color: difficulty === d ? c.text : "var(--text-primary)" }}>
                    {d}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {descriptions[d]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Topic <span style={{ fontWeight: 400 }}>(optional — "Any" picks randomly)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  border: `1px solid ${topic === t ? "var(--accent)" : "var(--border)"}`,
                  background: topic === t ? "var(--accent-glow)" : "transparent",
                  color: topic === t ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="glow-card p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            Language
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className="py-3 rounded-lg text-sm transition-all"
                style={{
                  fontFamily: "JetBrains Mono",
                  border: `1px solid ${language === l ? "var(--accent)" : "var(--border)"}`,
                  background: language === l ? "var(--accent-glow)" : "transparent",
                  color: language === l ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-lg text-base font-semibold transition-all"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "2px solid rgba(99,102,241,0.4)",
            color: "#818cf8",
            fontFamily: "Syne",
            fontWeight: 700,
          }}
          onClick={handleStart}
          disabled={!finalRole.trim()}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.25)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          Generate Problem →
        </button>

        {/* Info footer */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "1rem" }}>💡</span>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Problems are AI-generated and unique every session. You get 5 hidden test cases, 3 progressive hints, a live Monaco editor, and code execution via Judge0. After submitting, Gemini evaluates your approach, time complexity, and code quality.
          </p>
        </div>

      </div>
    </div>
  );
}
