import ParticleBackground from "./ParticleBackground";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "../firebase/config";
const inputStyle = {
  width: "100%",
  background: "#0e0e0e",
  border: "1px solid #1c1c1c",
  borderLeft: "2px solid #1c1c1c",
  color: "#e8e0d0",
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 13,
  padding: "13px 14px",
  outline: "none",
  letterSpacing: "0.05em",
  transition: "border-color 0.2s",
};
const Field = ({ label, type, placeholder, value, onChange, onKeyDown }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#7a4e08" }}>//</span>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#4a4440", letterSpacing: "0.2em", textTransform: "uppercase" }}>{label}</span>
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = "#e8a020"; e.target.style.borderLeftColor = "#e8a020"; e.target.style.background = "#111"; }}
      onBlur={e => { e.target.style.borderColor = "#1c1c1c"; e.target.style.borderLeftColor = "#1c1c1c"; e.target.style.background = "#0e0e0e"; }}
    />
  </div>
);
export default function Login({ onLogin }) {
  const [tab, setTab] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const handleSignIn = async () => {
    if (!email || !password) return showError("All fields required.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (e) {
      showError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) return showError("All fields required.");
    if (password.length < 8) return showError("Password must be 8+ characters.");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      onLogin();
    } catch (e) {
      showError(
        e.message.includes("email-already-in-use")
          ? "Email already registered. Try signing in."
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (e) {
      showError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );





  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a ", color: "#c8c0a8", fontFamily: "'Rajdhani', sans-serif", overflow: "hidden", position: "relative" }}>
      <ParticleBackground />
      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)"
      }} />

      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "72px 1fr 1fr" }}>

        {/* Sidebar */}
        <aside style={{ background: "#0e0e0e", borderRight: "1px solid #1c1c1c", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", position: "relative" }}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 1, opacity: 0.4, background: "linear-gradient(180deg, transparent, #e8a020, #7a4e08, transparent)" }} />
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 900, color: "#e8a020", writingMode: "vertical-rl", letterSpacing: "0.3em", marginBottom: 32, textShadow: "0 0 20px rgba(232,160,32,0.5)" }}>CareerPilot</div>
          {[{ c: "#39ff8a", l: "SYS" }, { c: "#e8a020", l: "AI" }, { c: "#222", l: "REC" }].map(({ c, l }) => (
            <div key={l} style={{ width: "100%", borderTop: "1px solid #1c1c1c", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: c !== "#222" ? `0 0 8px ${c}` : "none", animation: c !== "#222" ? "pulse 2s infinite" : "none" }} />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#4a4440", writingMode: "vertical-rl", letterSpacing: "0.1em" }}>{l}</span>
            </div>
          ))}
        </aside>

        {/* Left panel */}
        <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #1c1c1c", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -200, left: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,160,32,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#e8a020", letterSpacing: "0.25em" }}>▶ CAREERPILOT — v3.0</span>
            </div>
            <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 52, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.02em", color: "#e8e0d0" }}>
              CAREER<br /><span style={{ color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,0.3)" }}>PILOT</span>
            </h1>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#4a4440", marginTop: 20, lineHeight: 1.8, letterSpacing: "0.05em" }}>
              // AI-POWERED MOCK INTERVIEWS<br />// SIMULATE · ANALYZE · IMPROVE<br />// TURN ANXIETY INTO CONFIDENCE
            </p>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1c1c1c", border: "1px solid #1c1c1c" }}>
              {[["98%", "Accuracy Rate"], ["2.4s", "Avg Response"], ["12+", "Roles Covered"], ["∞", "Practice Sessions"]].map(([v, l]) => (
                <div key={l} style={{ background: "#0e0e0e", padding: 16 }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 700, color: "#e8a020", textShadow: "0 0 15px rgba(232,160,32,0.3)" }}>{v}</div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#4a4440", letterSpacing: "0.15em", marginTop: 4, textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em", lineHeight: 1.8 }}>
            Made on coffee<br /> in 12 hours
          </div>
        </div>

        {/* Right panel - form */}
        <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: -200, right: -200, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(57,255,138,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 520, width: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 1, background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#39ff8a", letterSpacing: "0.2em" }}>AUTHENTICATION REQUIRED</span>
              </div>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, color: "#e8e0d0", letterSpacing: "0.05em" }}>Access the Cockpit</h2>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", border: "1px solid #1c1c1c", marginBottom: 28, background: "#0e0e0e" }}>
              {[["signin", "Sign In"], ["signup", "Register"]].map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: "12px", fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                  letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", border: "none", transition: "all 0.2s",
                  background: tab === t ? "#e8a020" : "transparent",
                  color: tab === t ? "#080808" : "#4a4440",
                }}>{l}</button>
              ))}
            </div>

            {tab === "signup" && (
              <Field label="Full Name" type="text" placeholder="Username" value={name} onChange={e => setName(e.target.value)} />
            )}
            <Field label="Email Address" type="email" placeholder="Email@email.emo" value={email} onChange={e => setEmail(e.target.value)} />
            <Field label="Password" type="password" placeholder={tab === "signup" ? "min. 8 characters" : "••••••••••"} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (tab === "signin" ? handleSignIn() : handleSignUp())} />

            {error && (
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#ff5555", padding: "10px 12px", background: "rgba(255,85,85,0.06)", borderLeft: "2px solid #ff5555", letterSpacing: "0.05em", marginTop: 12 }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={tab === "signin" ? handleSignIn : handleSignUp} disabled={loading}
              style={{
                width: "100%", marginTop: 16, padding: 16, background: "#e8a020", color: "#080808", border: "none",
                fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.4 : 1, transition: "all 0.2s",
              }}>
              {loading ? "▷  PROCESSING..." : tab === "signin" ? "▶  INITIATE SESSION" : "▶  CREATE PILOT ACCOUNT"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#1c1c1c" }} />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: "#2a2a2a", letterSpacing: "0.15em" }}>or authenticate via</span>
              <div style={{ flex: 1, height: 1, background: "#1c1c1c" }} />
            </div>

            <button onClick={handleGoogle} disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "transparent", border: "1px solid #1c1c1c", color: "#4a4440",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.1em",
                padding: 13, cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#c8c0a8"; e.currentTarget.style.background = "#0e0e0e"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#4a4440"; e.currentTarget.style.background = "transparent"; }}>
              <GoogleIcon /> GOOGLE
            </button>

          </div>
        </div>
      </div>

      {/* Status strip */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0e0e0e", borderTop: "1px solid #1c1c1c", padding: "8px 24px", display: "flex", alignItems: "center", gap: 24, zIndex: 10 }}>
        {[{ c: "#39ff8a", l: "GEMINI 2.0 FLASH" }, { c: "#39ff8a", l: "FIREBASE AUTH" }, { c: "#e8a020", l: "VOICE MODULE STANDBY" }].map(({ c, l }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#4a4440", letterSpacing: "0.1em" }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#2a2a2a", letterSpacing: "0.1em" }}>Made on coffee </span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
