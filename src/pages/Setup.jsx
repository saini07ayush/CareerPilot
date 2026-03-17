// src/pages/Setup.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseResume } from "../lib/resumeParser";

const ROLES = [
  "Software Engineer", "Data Scientist", "Product Manager", "Frontend Developer",
  "Backend Developer", "ML Engineer", "DevOps Engineer", "Business Analyst",
  "UI/UX Designer", "Marketing Manager", "Finance Analyst", "Custom..."
];

export default function Setup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewMode, setInterviewMode] = useState("standard");
  const [interviewType, setInterviewType] = useState("mixed");

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const finalRole = role === "Custom..." ? customRole : role;

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setResumeError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File too large. Max 5MB.");
      return;
    }
    setResumeFile(file);
    setResumeError("");
    setParsingResume(true);
    try {
      const parsed = await parseResume(file);
      setResumeData(parsed);
      // Auto-fill role from resume if not already set
      if (!role && parsed.currentRole) {
        const matched = ROLES.find(r =>
          r.toLowerCase().includes(parsed.currentRole.toLowerCase().split(" ")[0])
        );
        if (matched) setRole(matched);
      }
    } catch (err) {
      console.error(err);
      setResumeError("Could not parse resume. You can still continue without it.");
      setResumeData(null);
    } finally {
      setParsingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeData(null);
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStart = () => {
    if (!finalRole.trim()) return;
    navigate("/interview", {
      state: { role: finalRole, jobDescription, interviewMode, interviewType, resumeData },
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto page-enter">
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
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Hey, {user?.displayName?.split(" ")[0] || "there"} 👋
          </span>
        </div>

        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem" }}>
          Set up your interview
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>Configure your session before we begin.</p>

        {/* Interview Mode */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Interview Format</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "standard", label: "Standard Mock", desc: "Conversational with follow-up questions", icon: "💬" },
              { key: "hirevue", label: "HireVue Simulation", desc: "One-shot timed answers, no follow-ups", icon: "🎯" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setInterviewMode(m.key)}
                className="text-left p-4 rounded-lg transition-all"
                style={{
                  border: `2px solid ${interviewMode === m.key ? "var(--accent)" : "var(--border)"}`,
                  background: interviewMode === m.key ? "var(--accent-glow)" : "var(--bg-secondary)",
                }}
              >
                <div className="text-xl mb-2">{m.icon}</div>
                <div className="font-semibold text-sm" style={{ fontFamily: "Syne", color: interviewMode === m.key ? "var(--accent)" : "var(--text-primary)" }}>
                  {m.label}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div className="glow-card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Resume Upload</p>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--border)" }}>
              Personalizes questions
            </span>
          </div>

          {!resumeFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
              onDragLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border)";
                const file = e.dataTransfer.files?.[0];
                if (file) handleResumeUpload({ target: { files: [file] } });
              }}
            >
              <div className="text-2xl mb-2">📄</div>
              <p className="text-sm font-medium" style={{ fontFamily: "Syne" }}>Click or drag to upload your resume</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PDF only · Max 5MB · Optional but recommended</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </div>
          ) : parsingResume ? (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="pulse-dot" style={{ width: 8, height: 8, flexShrink: 0 }} />
              <div>
                <p className="text-sm font-medium" style={{ fontFamily: "Syne" }}>Parsing {resumeFile.name}...</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Gemini is reading your resume to personalize questions</p>
              </div>
            </div>
          ) : resumeData ? (
            <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--accent)", fontSize: "1.1rem" }}>✓</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "Syne" }}>{resumeFile.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {resumeData.name} · {resumeData.currentRole}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveResume}
                  className="text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.target.style.color = "#f87171"}
                  onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
                >
                  Remove
                </button>
              </div>
              {/* Skills preview */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {resumeData.skills?.slice(0, 8).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {s}
                  </span>
                ))}
                {resumeData.skills?.length > 8 && (
                  <span className="text-xs px-2 py-0.5" style={{ color: "var(--text-muted)" }}>
                    +{resumeData.skills.length - 8} more
                  </span>
                )}
              </div>
              {resumeData.projects?.length > 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Projects: {resumeData.projects.map(p => p.name).join(", ")}
                </p>
              )}
            </div>
          ) : null}

          {resumeError && (
            <p className="text-xs mt-2 px-3 py-2 rounded" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
              {resumeError}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Target Role *</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {ROLES.map((r) => (
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
              className="input-field mt-2"
              placeholder="Enter your role..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              autoFocus
            />
          )}
        </div>

        {/* Question Mix */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Question Mix</p>
          <div className="flex gap-2">
            {["mixed", "technical", "behavioral"].map((t) => (
              <button
                key={t}
                onClick={() => setInterviewType(t)}
                className="flex-1 py-2 rounded-lg text-sm capitalize transition-all"
                style={{
                  border: `1px solid ${interviewType === t ? "var(--accent)" : "var(--border)"}`,
                  background: interviewType === t ? "var(--accent-glow)" : "transparent",
                  color: interviewType === t ? "var(--accent)" : "var(--text-secondary)",
                  fontFamily: "Syne",
                  fontWeight: 600,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="glow-card p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Job Description <span style={{ fontWeight: 400 }}>(optional — makes questions more targeted)</span>
          </p>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          className="btn-primary w-full py-4 text-base"
          onClick={handleStart}
          disabled={!finalRole.trim() || parsingResume}
        >
          {parsingResume
            ? "Parsing resume..."
            : resumeData
              ? `Start ${interviewMode === "hirevue" ? "HireVue Simulation" : "Personalized Interview"} →`
              : interviewMode === "hirevue"
                ? "Start HireVue Simulation →"
                : "Start Interview →"}
        </button>
      </div>
    </div>
  );
}
