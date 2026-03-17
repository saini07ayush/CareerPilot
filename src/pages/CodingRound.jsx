// src/pages/CodingRound.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { evaluateCodeSolution } from "../lib/geminiDSA";
import { runTestCases, runCustomInput, LANGUAGE_LABELS } from "../lib/codeRunner";
import { getQuestion } from "../lib/questionBank";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const LANGUAGES = ["python", "javascript", "cpp", "java"];

const DIFF_COLORS = {
  Easy:   { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  text: "#22c55e" },
  Medium: { bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", text: "#facc15" },
  Hard:   { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  text: "#ef4444" },
};

export default function CodingRound() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const startTimeRef = useRef(null);

  const { role, behavioralScore, difficulty: initDiff, language: initLang, topic: initTopic, standalone } = state || {};
  const [difficulty, setDifficulty] = useState(initDiff || "Medium");
  const [language, setLanguage] = useState(initLang || "python");
  const [topic] = useState(initTopic || "Any");
  const [phase, setPhase] = useState(standalone ? "loading" : "setup");

  // Problem
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");

  // Editor
  const [code, setCode] = useState("");
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  // Execution
  const [testResults, setTestResults] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [runningCustom, setRunningCustom] = useState(false);
  const [activeTab, setActiveTab] = useState("testcases"); // testcases | custom
  const [hintsShown, setHintsShown] = useState(0);

  // Evaluation
  const [evaluation, setEvaluation] = useState(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Auto-load problem when coming from CodingSetup (standalone=true)
  useEffect(() => {
    if (!standalone) return;
    try {
      const p = getQuestion(difficulty, topic);
      setProblem(p);
      setCustomInput(p.examples?.[0]?.input || "");
      setPhase("coding");
    } catch (e) {
      setError("Failed to load problem.");
      setPhase("setup");
    }
  }, []);

  // Load Monaco Editor
  useEffect(() => {
    if (monacoLoaded) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
    script.onload = () => {
      window.require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" }
      });
      setMonacoLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Init editor when Monaco loaded + problem ready + container exists
  useEffect(() => {
    if (!monacoLoaded || !problem || phase !== "coding") return;
    const tryInit = () => {
      const container = document.getElementById("monaco-container");
      if (!container || !window.require) return;
      window.require(["vs/editor/editor.main"], (monaco) => {
        if (monacoRef.current) return; // already initialized
        monacoRef.current = monaco.editor.create(container, {
          value: problem.starterCode[language] || "# Write your solution here\n",
          language: language === "cpp" ? "cpp" : language === "java" ? "java" : language,
          theme: "vs-dark",
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          roundedSelection: true,
          renderLineHighlight: "line",
        });
        monacoRef.current.onDidChangeModelContent(() => {
          setCode(monacoRef.current.getValue());
        });
        setCode(problem.starterCode[language] || "");
      });
    };
    setTimeout(tryInit, 100);
  }, [monacoLoaded, problem, phase]);

  // Update editor language when language changes
  useEffect(() => {
    if (!monacoRef.current || !problem) return;
    const newCode = problem.starterCode[language] || "";
    monacoRef.current.setValue(newCode);
    setCode(newCode);
    // Update language model
    if (window.monaco) {
      const langMap = { python: "python", javascript: "javascript", cpp: "cpp", java: "java" };
      window.monaco.editor.setModelLanguage(monacoRef.current.getModel(), langMap[language]);
    }
  }, [language]);

  // Timer
  useEffect(() => {
    if (phase === "coding") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Generate problem
  const handleStart = async () => {
    setPhase("loading");
    setError("");
    try {
      const p = getQuestion(difficulty, topic);
      setProblem(p);
      setCustomInput(p.examples?.[0]?.input || "");
      setPhase("coding");
    } catch (e) {
      setError("Failed to load problem. Please try again.");
      setPhase("setup");
    }
  };

  // Run against all test cases
  const handleRunTests = async () => {
    if (!code.trim()) return;
    clearInterval(timerRef.current);
    setPhase("running");
    setTestResults([]);
    try {
      const results = await runTestCases(code, language, problem.testCases);
      setTestResults(results);
      setActiveTab("testcases");
    } catch (e) {
      setError("Code execution failed: " + e.message);
    } finally {
      setPhase("coding");
    }
  };

  // Run with custom input
  const handleRunCustom = async () => {
    if (!code.trim()) return;
    setRunningCustom(true);
    setCustomOutput("");
    try {
      const result = await runCustomInput(code, language, customInput);
      setCustomOutput(result.output + (result.time ? `\n\n⏱ ${result.time}s` : ""));
    } catch (e) {
      setCustomOutput("Error: " + e.message);
    } finally {
      setRunningCustom(false);
    }
  };

  // Submit for AI evaluation
  const handleSubmit = async () => {
    if (!code.trim()) return;
    clearInterval(timerRef.current);
    const timeTaken = elapsed;

    // Run tests first if not done
    let results = testResults;
    if (results.length === 0) {
      setPhase("running");
      try {
        results = await runTestCases(code, language, problem.testCases);
        setTestResults(results);
      } catch (e) {
        results = [];
      }
    }

    setPhase("evaluating");
    try {
      const eval_ = await evaluateCodeSolution({
        role, problem, code, language,
        testResults: results,
        timeTaken,
      });
      setEvaluation(eval_);
      setPhase("done");
    } catch (e) {
      setError("Evaluation failed: " + e.message);
      setPhase("coding");
    }
  };

  // ── Setup screen ──────────────────────────────────────────────────────────────
  if (phase === "setup") return (
    <div className="min-h-screen p-4 md:p-8 page-enter" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#040806" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontFamily: "Syne", fontWeight: 800 }}>CareerPilot</span>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "Syne" }}>
            Round 2
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Coding Interview</span>
        </div>
        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "2rem", marginBottom: "0.5rem" }}>DSA Challenge</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          Behavioral round complete{behavioralScore ? ` — scored ${behavioralScore}/100` : ""}. Now let's test your coding skills.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Difficulty */}
        <div className="glow-card p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Difficulty</p>
          <div className="flex gap-3">
            {DIFFICULTIES.map(d => {
              const c = DIFF_COLORS[d];
              return (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    fontFamily: "Syne",
                    border: `2px solid ${difficulty === d ? c.border : "var(--border)"}`,
                    background: difficulty === d ? c.bg : "transparent",
                    color: difficulty === d ? c.text : "var(--text-muted)",
                  }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div className="glow-card p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Language</p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className="py-2.5 rounded-lg text-sm transition-all"
                style={{
                  fontFamily: "JetBrains Mono",
                  border: `1px solid ${language === l ? "var(--accent)" : "var(--border)"}`,
                  background: language === l ? "var(--accent-glow)" : "transparent",
                  color: language === l ? "var(--accent)" : "var(--text-secondary)",
                }}>
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full py-4 text-base" onClick={handleStart}>
          Generate Problem →
        </button>
      </div>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="pulse-dot mx-auto mb-4" style={{ width: 12, height: 12 }} />
        <p style={{ color: "var(--text-muted)", fontFamily: "Syne" }}>Generating your {difficulty} problem...</p>
      </div>
    </div>
  );

  // ── Evaluating ────────────────────────────────────────────────────────────────
  if (phase === "evaluating") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="pulse-dot mx-auto mb-4" style={{ width: 12, height: 12 }} />
        <p style={{ fontFamily: "Syne", fontWeight: 600 }}>Evaluating your solution...</p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Analysing approach, complexity, and code quality</p>
      </div>
    </div>
  );

  // ── Done / Results ────────────────────────────────────────────────────────────
  if (phase === "done" && evaluation) {
    const passed = testResults.filter(t => t.passed).length;
    const dc = DIFF_COLORS[problem.difficulty];
    return (
      <div className="min-h-screen p-4 md:p-8 page-enter" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-4xl mb-3">💻</div>
            <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "1.75rem" }}>Coding Round Complete</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{problem.title} · {problem.difficulty} · {LANGUAGE_LABELS[language]}</p>
          </div>

          {/* Score */}
          <div className="glow-card p-6 mb-5 text-center">
            <div className="gradient-text" style={{ fontFamily: "JetBrains Mono", fontSize: "3.5rem", fontWeight: 700, lineHeight: 1 }}>
              {evaluation.overallScore}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>/ 100</div>
            <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", color: "var(--accent)", fontFamily: "Syne" }}>
              {evaluation.verdict}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Correctness", val: evaluation.correctness, max: 25 },
              { label: "Code Quality", val: evaluation.codeQuality, max: 25 },
              { label: "Complexity", val: evaluation.timeComplexity, max: 25 },
              { label: "Problem Solving", val: evaluation.problemSolving, max: 25 },
            ].map(s => (
              <div key={s.label} className="glow-card p-4 text-center">
                <div className="gradient-text font-mono font-bold text-xl">{s.val}<span className="text-sm" style={{ color: "var(--text-muted)" }}>/{s.max}</span></div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Test results */}
          <div className="glow-card p-5 mb-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Test Cases — {passed}/{testResults.length} passed
            </p>
            <div className="flex flex-wrap gap-2">
              {testResults.map((t, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded font-mono" style={{
                  background: t.passed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: t.passed ? "var(--accent)" : "#f87171",
                  border: `1px solid ${t.passed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  {t.passed ? "✓" : "✗"} Test {i + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity analysis */}
          <div className="glow-card p-5 mb-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Complexity Analysis</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Your solution</p>
                <p className="text-sm font-mono" style={{ color: evaluation.isOptimal ? "var(--accent)" : "#facc15" }}>
                  Time: {evaluation.detectedTimeComplexity}
                </p>
                <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                  Space: {evaluation.detectedSpaceComplexity}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Optimal</p>
                <p className="text-sm font-mono" style={{ color: "var(--accent)" }}>Time: {problem.timeComplexity}</p>
                <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>Space: {problem.spaceComplexity}</p>
              </div>
            </div>
            <p className="text-xs mt-3 px-3 py-2 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
              Approach: {evaluation.detectedApproach} {evaluation.isOptimal ? "✓ Optimal" : `→ could use ${problem.optimalApproach}`}
            </p>
          </div>

          {/* Strengths + improvements */}
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div className="glow-card p-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Strengths</p>
              {evaluation.strengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
            <div className="glow-card p-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Improvements</p>
              {evaluation.improvements?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: "#facc15" }}>→</span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interviewer note */}
          <div className="glow-card p-5 mb-5">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Interviewer's Note</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>"{evaluation.interviewerNote}"</p>
          </div>

          {/* Optimal solution */}
          <div className="glow-card p-5 mb-8">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Optimal Solution</p>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{evaluation.explanation}</p>
            <pre className="text-xs p-4 rounded overflow-x-auto" style={{ background: "var(--bg-secondary)", color: "#86efac", fontFamily: "JetBrains Mono", lineHeight: 1.6 }}>
              {evaluation.optimalSolution}
            </pre>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => { setPhase("setup"); setProblem(null); setEvaluation(null); setTestResults([]); monacoRef.current = null; }}>
              Try Another
            </button>
            <button className="btn-ghost flex-1" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Coding screen ─────────────────────────────────────────────────────────────
  const dc = problem ? DIFF_COLORS[problem.difficulty] : {};
  const passed = testResults.filter(t => t.passed).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", height: "100vh" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#040806" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {problem && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ fontFamily: "Syne" }}>{problem.title}</span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text, fontFamily: "Syne" }}>
                {problem.difficulty}
              </span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {problem.topic}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <span className="text-sm font-mono" style={{ color: elapsed > 1800 ? "#f87171" : elapsed > 1200 ? "#facc15" : "var(--text-muted)" }}>
            ⏱ {formatTime(elapsed)}
          </span>
          {/* Language selector */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="text-xs py-1 px-2 rounded"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "JetBrains Mono", outline: "none" }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>)}
          </select>
          {/* Hint button */}
          {problem && hintsShown < problem.hints?.length && (
            <button
              onClick={() => setHintsShown(h => h + 1)}
              className="text-xs py-1 px-3 rounded"
              style={{ border: "1px solid var(--border)", color: "#facc15", background: "rgba(250,204,21,0.05)" }}
            >
              💡 Hint {hintsShown + 1}
            </button>
          )}
          <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => navigate("/dashboard")}>Exit</button>
        </div>
      </div>

      {/* Hints bar */}
      {hintsShown > 0 && problem && (
        <div className="px-4 py-2 shrink-0" style={{ background: "rgba(250,204,21,0.05)", borderBottom: "1px solid rgba(250,204,21,0.15)" }}>
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <p key={i} className="text-xs" style={{ color: "#facc15" }}>💡 Hint {i + 1}: {h}</p>
          ))}
        </div>
      )}

      {/* Error bar */}
      {error && (
        <div className="px-4 py-2 shrink-0 text-xs" style={{ background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Problem statement */}
        <div className="w-2/5 overflow-y-auto p-4 shrink-0" style={{ borderRight: "1px solid var(--border)" }}>
          {problem && (
            <>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{problem.description}</p>

              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Input format</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{problem.inputFormat}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Output format</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{problem.outputFormat}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Constraints</p>
                {problem.constraints?.map((c, i) => (
                  <p key={i} className="text-xs font-mono mb-1" style={{ color: "var(--text-secondary)" }}>• {c}</p>
                ))}
              </div>

              {problem.examples?.map((ex, i) => (
                <div key={i} className="mb-4">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Example {i + 1}</p>
                  <div className="p-3 rounded mb-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                    <p className="text-xs font-mono mb-1" style={{ color: "var(--text-muted)" }}>Input:</p>
                    <pre className="text-xs font-mono mb-2" style={{ color: "var(--accent)" }}>{ex.input}</pre>
                    <p className="text-xs font-mono mb-1" style={{ color: "var(--text-muted)" }}>Output:</p>
                    <pre className="text-xs font-mono mb-2" style={{ color: "#86efac" }}>{ex.output}</pre>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ex.explanation}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT — Editor + Console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco editor */}
          <div className="flex-1" id="monaco-container" style={{ minHeight: 0 }} />

          {/* Bottom console */}
          <div className="shrink-0" style={{ borderTop: "1px solid var(--border)", height: "220px" }}>
            {/* Tab bar */}
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex gap-1">
                {["testcases", "custom"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="text-xs px-3 py-1 rounded transition-all capitalize"
                    style={{
                      background: activeTab === tab ? "var(--accent-glow)" : "transparent",
                      color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${activeTab === tab ? "var(--accent)" : "transparent"}`,
                    }}>
                    {tab === "testcases" ? `Test Cases ${testResults.length > 0 ? `(${passed}/${testResults.length})` : ""}` : "Custom Input"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={phase === "running" ? null : handleRunTests}
                  disabled={phase === "running" || !code.trim()}
                  className="text-xs px-3 py-1.5 rounded transition-all"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)", cursor: phase === "running" ? "not-allowed" : "pointer", opacity: !code.trim() ? 0.4 : 1 }}
                >
                  {phase === "running" ? "Running..." : "▶ Run Tests"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!code.trim() || phase === "running"}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Submit →
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto p-3" style={{ height: "170px" }}>
              {activeTab === "testcases" ? (
                testResults.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Click "Run Tests" to execute your code against all test cases.</p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((t, i) => (
                      <div key={i} className="p-2 rounded" style={{
                        background: t.passed ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                        border: `1px solid ${t.passed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: t.passed ? "var(--accent)" : "#f87171" }}>
                            {t.passed ? "✓" : "✗"} Test {i + 1}
                          </span>
                          {t.time && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.time}s</span>}
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.status}</span>
                        </div>
                        {!t.passed && (
                          <div className="text-xs font-mono space-y-0.5">
                            <p style={{ color: "var(--text-muted)" }}>Input: <span style={{ color: "var(--text-secondary)" }}>{t.input?.slice(0, 60)}</span></p>
                            <p style={{ color: "var(--text-muted)" }}>Expected: <span style={{ color: "var(--accent)" }}>{t.expected}</span></p>
                            <p style={{ color: "var(--text-muted)" }}>Got: <span style={{ color: "#f87171" }}>{t.actual?.slice(0, 60)}</span></p>
                            {t.error && <p style={{ color: "#f87171" }}>{t.error?.slice(0, 100)}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex gap-3 h-full">
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Input</p>
                    <textarea
                      className="input-field text-xs font-mono"
                      rows={4}
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="Enter custom input..."
                    />
                    <button onClick={handleRunCustom} disabled={runningCustom || !code.trim()}
                      className="mt-2 text-xs px-3 py-1.5 rounded transition-all"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)", opacity: !code.trim() ? 0.4 : 1 }}>
                      {runningCustom ? "Running..." : "▶ Run"}
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Output</p>
                    <pre className="text-xs font-mono p-2 rounded h-24 overflow-auto" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: customOutput.startsWith("Error") ? "#f87171" : "#86efac" }}>
                      {customOutput || "Output will appear here..."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
