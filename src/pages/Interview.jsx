// src/pages/Interview.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSpeech } from "../hooks/useSpeech";
import { saveSession } from "../lib/firestore";
import {
  generateInterviewQuestions,
  generateFollowUp,
  evaluateAnswer,
  evaluateHireVueAnswer,
  generateOverallFeedback,
} from "../lib/gemini";
import { generateResumeAwareQuestions } from "../lib/resumeParser";
import TimerRing from "../components/TimerRing";

const THINK_TIME = 30;
const ANSWER_TIME = 90;

export default function Interview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isListening, transcript, supported, startListening, stopListening, resetTranscript } = useSpeech();

  const { role, jobDescription, interviewMode, interviewType, resumeData } = state || {};

  // Core state
  const [phase, setPhase] = useState("loading"); // loading | thinking | answering | evaluating | done
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState([]); // { question, answer, evaluation, isFollowUp }
  const [followUpQ, setFollowUpQ] = useState(null);
  const [isFollowUpMode, setIsFollowUpMode] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState(null);
  const [error, setError] = useState("");

  // HireVue timers
  const [thinkTimer, setThinkTimer] = useState(THINK_TIME);
  const [answerTimer, setAnswerTimer] = useState(ANSWER_TIME);
  const [timeUsed, setTimeUsed] = useState(0);
  const timerRef = useRef(null);
  const answerStartRef = useRef(null);

  // Load questions
  useEffect(() => {
    if (!role) { navigate("/setup"); return; }
    const generator = resumeData
      ? generateResumeAwareQuestions({ resumeData, role, jobDescription, mode: interviewMode })
      : generateInterviewQuestions({ role, jobDescription, mode: interviewMode });
    generator
      .then((qs) => { setQuestions(qs); setPhase(interviewMode === "hirevue" ? "thinking" : "answering"); })
      .catch(() => setError("Failed to generate questions. Check your Gemini API key."));
  }, []);

  // HireVue think timer
  useEffect(() => {
    if (interviewMode !== "hirevue" || phase !== "thinking") return;
    setThinkTimer(THINK_TIME);
    timerRef.current = setInterval(() => {
      setThinkTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase("answering"); answerStartRef.current = Date.now(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentIdx, interviewMode]);

  // HireVue answer timer
  useEffect(() => {
    if (interviewMode !== "hirevue" || phase !== "answering") return;
    if (!answerStartRef.current) answerStartRef.current = Date.now();
    setAnswerTimer(ANSWER_TIME);
    timerRef.current = setInterval(() => {
      setAnswerTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentIdx, interviewMode]);

  // Sync speech transcript to answer
  useEffect(() => {
    if (isListening) setCurrentAnswer(transcript);
  }, [transcript, isListening]);

  const currentQuestion = isFollowUpMode ? followUpQ : questions[currentIdx];

  const handleVoiceToggle = () => {
    if (isListening) { stopListening(); }
    else { resetTranscript(); startListening(() => {}); }
  };

  const handleSubmitAnswer = useCallback(async (autoSubmit = false) => {
    if (interviewMode === "hirevue") clearInterval(timerRef.current);
    if (!currentAnswer.trim() && !autoSubmit) return;

    const answer = currentAnswer.trim() || "[No answer provided]";
    const question = currentQuestion;
    if (isListening) stopListening();

    setPhase("evaluating");

    try {
      let evaluation;
      if (interviewMode === "hirevue") {
        const used = answerStartRef.current ? Math.round((Date.now() - answerStartRef.current) / 1000) : ANSWER_TIME;
        setTimeUsed(used);
        evaluation = await evaluateHireVueAnswer({ role, question, answer, timeUsed: used, timeAllowed: ANSWER_TIME });
      } else {
        evaluation = await evaluateAnswer({ role, question, answer, isFollowUp: isFollowUpMode });
      }

      const record = { question, answer, evaluation, isFollowUp: isFollowUpMode };
      const newAnswers = [...answers, record];
      setAnswers(newAnswers);
      setCurrentAnswer("");
      resetTranscript();

      // Standard mode: offer follow-up once per question
      if (interviewMode === "standard" && !isFollowUpMode && evaluation.score >= 4) {
        const fq = await generateFollowUp({ role, question, answer });
        setFollowUpQ(fq);
        setIsFollowUpMode(true);
        setPhase("answering");
        return;
      }

      // Move to next question or finish
      setIsFollowUpMode(false);
      setFollowUpQ(null);
      const nextIdx = currentIdx + 1;
      if (nextIdx < questions.length) {
        setCurrentIdx(nextIdx);
        answerStartRef.current = null;
        setPhase(interviewMode === "hirevue" ? "thinking" : "answering");
      } else {
        setPhase("evaluating");
        const overall = await generateOverallFeedback({ role, answers: newAnswers, mode: interviewMode });
        setOverallFeedback(overall);

        // Save to Firestore
        try {
          await saveSession(user.uid, { role, jobDescription, interviewMode, interviewType, answers: newAnswers, overallFeedback: overall });
        } catch (e) { console.warn("Could not save session:", e); }

        setPhase("done");
      }
    } catch (e) {
      console.error(e);
      setError("Evaluation failed. Check your API key and try again.");
      setPhase("answering");
    }
  }, [currentAnswer, currentQuestion, answers, currentIdx, questions, isFollowUpMode, interviewMode, role, user]);

  // ── Renders ──────────────────────────────────────────────────────────────────

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      <div className="glow-card p-8 max-w-md text-center">
        <div className="text-3xl mb-4">⚠️</div>
        <p className="font-semibold mb-2" style={{ fontFamily: "Syne" }}>Something went wrong</p>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate("/setup")}>Back to Setup</button>
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="pulse-dot mx-auto mb-4" style={{ width: 12, height: 12 }} />
        <p style={{ color: "var(--text-muted)", fontFamily: "Syne" }}>Generating your interview...</p>
      </div>
    </div>
  );

  if (phase === "done" && overallFeedback) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto page-enter">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🎯</div>
            <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "2rem" }}>Interview Complete</h1>
            <p className="mt-2" style={{ color: "var(--text-muted)" }}>{role} · {interviewMode === "hirevue" ? "HireVue Simulation" : "Standard Mock"}</p>
          </div>

          {/* Overall score */}
          <div className="glow-card p-6 mb-6 text-center">
            <div className="gradient-text" style={{ fontFamily: "JetBrains Mono", fontSize: "4rem", fontWeight: 700, lineHeight: 1 }}>
              {overallFeedback.overallScore}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>/ 100 overall score</div>
            <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{
              background: "var(--accent-glow)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              fontFamily: "Syne",
            }}>
              {overallFeedback.readinessLevel}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="glow-card p-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Top Strengths</p>
              {overallFeedback.topStrengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
            <div className="glow-card p-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Key Improvements</p>
              {overallFeedback.keyImprovements?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: "#facc15" }}>→</span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="glow-card p-5 mb-6">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Next Steps</p>
            {overallFeedback.nextSteps?.map((s, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)" }}>0{i + 1}</span>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>

          {/* Per-question breakdown */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Question Breakdown</p>
            {answers.map((a, i) => (
              <div key={i} className="glow-card p-5 mb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium" style={{ fontFamily: "Syne" }}>
                    {a.isFollowUp && <span className="text-xs mr-2 px-1.5 py-0.5 rounded" style={{ background: "rgba(250,204,21,0.1)", color: "#facc15", border: "1px solid rgba(250,204,21,0.2)" }}>Follow-up</span>}
                    {a.question}
                  </p>
                  {interviewMode === "hirevue" ? (
                    <div className="text-right shrink-0">
                      <div className="gradient-text font-mono font-bold text-lg">{a.evaluation?.overall}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.evaluation?.readinessVerdict}</div>
                    </div>
                  ) : (
                    <div className="shrink-0 text-right">
                      <div className="gradient-text font-mono font-bold text-lg">{a.evaluation?.score}/10</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.evaluation?.verdict}</div>
                    </div>
                  )}
                </div>
                <p className="text-sm mb-3 p-3 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                  {a.answer}
                </p>
                {interviewMode === "hirevue" && a.evaluation?.starBreakdown && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {Object.entries(a.evaluation.starBreakdown).map(([k, v]) => (
                      <span key={k} className="text-xs px-2 py-1 rounded" style={{
                        background: v ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: v ? "var(--accent)" : "#f87171",
                        border: `1px solid ${v ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                      }}>
                        {k.toUpperCase()} {v ? "✓" : "✗"}
                      </span>
                    ))}
                    {a.evaluation.fillerWordCount > 0 && (
                      <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(250,204,21,0.1)", color: "#facc15", border: "1px solid rgba(250,204,21,0.2)" }}>
                        {a.evaluation.fillerWordCount} filler words ({a.evaluation.fillerRate})
                      </span>
                    )}
                  </div>
                )}
                {a.evaluation?.betterAnswer && (
                  <p className="text-xs p-3 rounded" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)", color: "var(--text-secondary)" }}>
                    💡 {a.evaluation.betterAnswer}
                  </p>
                )}
                {a.evaluation?.coachingTip && (
                  <p className="text-xs p-3 rounded" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)", color: "var(--text-secondary)" }}>
                    🎯 {a.evaluation.coachingTip}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => navigate("/setup")}>Practice Again</button>
            <button className="btn-ghost flex-1" onClick={() => navigate("/dashboard")}>View Dashboard</button>
          </div>
          <button
            className="w-full mt-3 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontFamily: "Syne" }}
            onClick={() => navigate("/coding", { state: { role, behavioralScore: overallFeedback?.overallScore } })}
          >
            Continue to Coding Round →
          </button>
        </div>
      </div>
    );
  }

  // ── Interview in progress ─────────────────────────────────────────────────────
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {interviewMode === "hirevue" && (
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "Syne" }}>
                  ● HireVue
                </span>
              )}
              {resumeData && (
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--border)", fontFamily: "Syne" }}>
                  ✦ Personalized
                </span>
              )}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{role}</span>
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Question {currentIdx + 1} of {questions.length}
              {isFollowUpMode && <span className="ml-2 text-yellow-400">Follow-up</span>}
            </div>
          </div>
          <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => navigate("/setup")}>Exit</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-8" style={{ background: "var(--border)" }}>
          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--accent)" }} />
        </div>

        {/* Question card */}
        <div className="glow-card p-6 mb-5">
          {phase === "evaluating" ? (
            <div className="text-center py-4">
              <div className="pulse-dot mx-auto mb-3" />
              <p style={{ color: "var(--text-muted)", fontFamily: "Syne" }}>Evaluating your answer...</p>
            </div>
          ) : (
            <>
              {/* HireVue timers */}
              {interviewMode === "hirevue" && (
                <div className="flex justify-center gap-8 mb-6">
                  {phase === "thinking" && (
                    <TimerRing seconds={thinkTimer} total={THINK_TIME} label="Think" />
                  )}
                  {phase === "answering" && (
                    <TimerRing seconds={answerTimer} total={ANSWER_TIME} label="Answer" />
                  )}
                </div>
              )}

              {phase === "thinking" && (
                <div className="text-center mb-4">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Prepare your answer</p>
                </div>
              )}

              <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.5 }}>
                {currentQuestion}
              </p>

              {interviewMode === "hirevue" && phase === "thinking" && (
                <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>Recording will start automatically when the think timer ends.</p>
              )}
            </>
          )}
        </div>

        {/* Answer input */}
        {(phase === "answering") && (
          <div className="glow-card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Your Answer</p>
              {supported && (
                <button
                  onClick={handleVoiceToggle}
                  className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-full transition-all"
                  style={{
                    border: `1px solid ${isListening ? "var(--accent)" : "var(--border)"}`,
                    background: isListening ? "var(--accent-glow)" : "transparent",
                    color: isListening ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {isListening ? (
                    <><div className="pulse-dot" style={{ width: 6, height: 6 }} /> Listening...</>
                  ) : (
                    <><span>🎙</span> Speak</>
                  )}
                </button>
              )}
            </div>
            <textarea
              className="input-field"
              rows={6}
              placeholder="Type your answer, or click Speak to use voice input..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
                {currentAnswer.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                className="btn-primary"
                onClick={() => handleSubmitAnswer(false)}
                disabled={!currentAnswer.trim()}
              >
                {currentIdx === questions.length - 1 && !isFollowUpMode ? "Finish →" : "Submit →"}
              </button>
            </div>
          </div>
        )}

        {/* HireVue think phase — no input, just wait */}
        {interviewMode === "hirevue" && phase === "thinking" && (
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Use this time to structure your answer using the STAR method.</p>
          </div>
        )}
      </div>
    </div>
  );
}
