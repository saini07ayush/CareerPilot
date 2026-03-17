import { useState, useEffect, useRef, useCallback } from "react";

const mono = "'Share Tech Mono', monospace";
const orbitron = "'Orbitron', monospace";
const rajdhani = "'Rajdhani', sans-serif";

function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(t);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  return { isListening, transcript, supported, startListening, stopListening, resetTranscript };
}

async function callGemini(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export default function InterviewScreen({ config, onComplete, onBack }) {
  const { role, mode, jobDescription } = config || {};
  const { isListening, transcript, supported, startListening, stopListening, resetTranscript } = useSpeech();

  const [phase, setPhase] = useState("loading");
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const answerRef = useRef(null);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Timer
  useEffect(() => {
    if (phase === "answering") {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Sync voice transcript
  useEffect(() => {
    if (isListening) setCurrentAnswer(transcript);
  }, [transcript, isListening]);

  // Start interview
  useEffect(() => {
    const start = async () => {
      try {
        const systemMsg = {
          role: "user",
          content: `You are a senior interviewer at a top tech company conducting a real job interview.
Role: ${role}
Mode: ${mode === "target" ? "Target — based on this job description: " + jobDescription : "Foundation — general role-based questions"}

RULES:
1. Ask ONE question at a time.
2. Start with a brief intro (1 sentence), then ask your first question.
3. After each answer, respond ONLY in this JSON format:
{
  "feedback": "2-3 sentences of honest feedback",
  "score": <1-10>,
  "strength": "one specific strength",
  "improvement": "one specific area to improve",
  "nextQuestion": "your next interview question"
}
4. After 3 questions, if you want to end the interview, set nextQuestion to "INTERVIEW_COMPLETE".
5. Keep going as long as the conversation flows naturally — like a real interview.
6. Be direct, professional, and realistic.

Start the interview now with your intro and first question. Return plain text only for this opening message.`
        };

        const openingRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [systemMsg],
          }),
        });
        const openingData = await openingRes.json();
        const opening = openingData.content?.[0]?.text || "";

        setCurrentQuestion(opening);
        setMessages([systemMsg, { role: "assistant", content: opening }]);
        setPhase("answering");
      } catch (e) {
        setError("Failed to start interview. Check your API key.");
      }
    };
    start();
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) stopListening();
    else { resetTranscript(); startListening(); }
  };

  const handleSubmit = useCallback(async () => {
    if (!currentAnswer.trim()) return;
    if (isListening) stopListening();

    const answer = currentAnswer.trim();
    setPhase("evaluating");
    setCurrentAnswer("");
    resetTranscript();

    const newMessages = [...messages, { role: "user", content: answer }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";

      let parsed;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch { parsed = null; }

      const updatedMessages = [...newMessages, { role: "assistant", content: raw }];
      setMessages(updatedMessages);

      const newAnswer = { question: currentQuestion, answer, evaluation: parsed };
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);
      setQuestionCount(q => q + 1);

      if (parsed?.nextQuestion === "INTERVIEW_COMPLETE") {
        onComplete({ answers: newAnswers, messages: updatedMessages, role, mode });
        return;
      }

      if (parsed?.nextQuestion) {
        setCurrentQuestion(parsed.nextQuestion);
      } else {
        setCurrentQuestion(raw);
      }

      setPhase("answering");
    } catch (e) {
      setError("Evaluation failed. Please try again.");
      setPhase("answering");
    }
  }, [currentAnswer, currentQuestion, messages, answers, isListening]);

  const handleEndInterview = () => {
    onComplete({ answers, messages, role, mode });
  };

  // ── Loading ──
  if (phase === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: orbitron, fontSize: 13, color: "#e8a020", letterSpacing: "0.2em", animation: "pulse 1.5s infinite" }}>GENERATING INTERVIEW...</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", letterSpacing: "0.15em" }}>ROLE: {role?.toUpperCase()}</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ border: "1px solid #ff5555", background: "#0a0a0a", padding: 32, maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#ff5555", marginBottom: 12, letterSpacing: "0.1em" }}>⚠ SYSTEM ERROR</div>
        <div style={{ fontFamily: rajdhani, fontSize: 15, color: "#c8c0a8", marginBottom: 20 }}>{error}</div>
        <button onClick={onBack} style={{ background: "#e8a020", color: "#080808", border: "none", fontFamily: orbitron, fontSize: 11, fontWeight: 700, padding: "12px 24px", cursor: "pointer", letterSpacing: "0.1em" }}>← GO BACK</button>
      </div>
    </div>
  );

  const progress = Math.min((questionCount / 8) * 100, 95);

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#c8c0a8", fontFamily: rajdhani, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1c1c1c", padding: "0 32px", display: "flex", alignItems: "center", height: 56, background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
        <div style={{ fontFamily: orbitron, fontSize: 14, fontWeight: 900, color: "#e8a020", letterSpacing: "0.1em" }}>CAREER<span style={{ color: "#c8c0a8" }}>PILOT</span></div>
        <div style={{ flex: 1 }} />

        {/* Timer */}
        <div style={{ fontFamily: mono, fontSize: 12, color: "#4a4440", letterSpacing: "0.1em", marginRight: 24 }}>
          {formatTime(elapsed)}
        </div>

        {/* Question counter */}
        <div style={{ fontFamily: mono, fontSize: 10, color: "#4a4440", letterSpacing: "0.1em", marginRight: 24 }}>
          Q{questionCount + 1} · {role?.toUpperCase()}
        </div>

        <button onClick={handleEndInterview} style={{
          background: "transparent", border: "1px solid #ff5555", color: "#ff5555",
          fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", padding: "6px 12px", cursor: "pointer", transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,85,85,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
          END INTERVIEW
        </button>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#1c1c1c", flexShrink: 0 }}>
        <div style={{ height: 2, background: "#e8a020", width: `${progress}%`, transition: "width 0.5s", boxShadow: "0 0 8px rgba(232,160,32,0.5)" }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 32px 120px", width: "100%", flex: 1 }}>

        {/* Question card */}
        <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a", marginBottom: 16, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(232,160,32,0.5), transparent)" }} />
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase === "evaluating" ? "#ff5555" : "#e8a020", boxShadow: `0 0 8px ${phase === "evaluating" ? "#ff5555" : "#e8a020"}`, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: phase === "evaluating" ? "#ff5555" : "#e8a020", letterSpacing: "0.2em" }}>
              {phase === "evaluating" ? "EVALUATING RESPONSE..." : "INTERVIEWER"}
            </span>
          </div>
          <div style={{ padding: 24 }}>
            {phase === "evaluating" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a020", animation: "pulse 1s infinite" }} />
                <span style={{ fontFamily: mono, fontSize: 12, color: "#4a4440", letterSpacing: "0.1em" }}>ANALYZING YOUR ANSWER...</span>
              </div>
            ) : (
              <p style={{ fontFamily: rajdhani, fontSize: 18, fontWeight: 500, color: "#e8e0d0", lineHeight: 1.6 }}>
                {currentQuestion}
              </p>
            )}
          </div>
        </div>

        {/* Answer input */}
        {phase === "answering" && (
          <div style={{ border: "1px solid #1c1c1c", background: "#0a0a0a" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1c1c1c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
                <span style={{ fontFamily: mono, fontSize: 10, color: "#39ff8a", letterSpacing: "0.2em" }}>YOUR RESPONSE</span>
              </div>
              {supported && (
                <button onClick={handleVoiceToggle} style={{
                  display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 10,
                  letterSpacing: "0.1em", padding: "6px 14px", cursor: "pointer", transition: "all 0.2s",
                  border: `1px solid ${isListening ? "#39ff8a" : "#1c1c1c"}`,
                  background: isListening ? "rgba(57,255,138,0.1)" : "transparent",
                  color: isListening ? "#39ff8a" : "#4a4440",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: isListening ? "#39ff8a" : "#4a4440", boxShadow: isListening ? "0 0 8px #39ff8a" : "none", animation: isListening ? "pulse 1s infinite" : "none" }} />
                  {isListening ? "LISTENING..." : "SPEAK"}
                </button>
              )}
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                ref={answerRef}
                rows={6}
                placeholder="Speak your answer or type here..."
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleSubmit()}
                style={{
                  width: "100%", background: "#0e0e0e", border: "1px solid #1c1c1c",
                  borderLeft: "2px solid #1c1c1c", color: "#e8e0d0",
                  fontFamily: mono, fontSize: 13, padding: "13px 14px",
                  outline: "none", letterSpacing: "0.03em", lineHeight: 1.7,
                  resize: "vertical", transition: "border-color 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = "#39ff8a"; e.target.style.borderLeftColor = "#39ff8a"; }}
                onBlur={e => { e.target.style.borderColor = "#1c1c1c"; e.target.style.borderLeftColor = "#1c1c1c"; }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em" }}>
                  {currentAnswer.split(/\s+/).filter(Boolean).length} WORDS · CTRL+ENTER TO SUBMIT
                </span>
                <button onClick={handleSubmit} disabled={!currentAnswer.trim()} style={{
                  background: currentAnswer.trim() ? "#e8a020" : "#1c1c1c",
                  color: currentAnswer.trim() ? "#080808" : "#2a2a2a",
                  border: "none", fontFamily: orbitron, fontWeight: 700, fontSize: 11,
                  letterSpacing: "0.15em", padding: "12px 24px", cursor: currentAnswer.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}>
                  SUBMIT →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status strip */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #1c1c1c", padding: "8px 24px", display: "flex", alignItems: "center", gap: 24, zIndex: 100 }}>
        {[{ c: "#39ff8a", l: "GEMINI CONNECTED" }, { c: isListening ? "#39ff8a" : "#e8a020", l: isListening ? "MIC ACTIVE" : "VOICE STANDBY" }].map(({ c, l }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em" }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c" }}>Q{questionCount + 1} · {formatTime(elapsed)}</span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
