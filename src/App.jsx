import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RoleSelector from "./components/RoleSelector";
import InterviewScreen from "./components/InterviewScreen";
import FeedbackScreen from "./components/FeedbackScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState(null); // { role, mode, jobDescription }
  const [interviewData, setInterviewData] = useState(null);     // { messages, scores, feedback }
  const [loading, setLoading] = useState(true);

  // Auto-login: if user is already signed in, skip login screen
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setScreen(u ? "dashboard" : "login");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = () => setScreen("dashboard");

  const handleLogout = () => setScreen("login");

  const handleStartInterview = (config) => {
    setInterviewConfig(config);
    setScreen("interview");
  };

  const handleInterviewComplete = (data) => {
    setInterviewData(data);
    setScreen("feedback");
  };

  const handleRestart = () => {
    setInterviewConfig(null);
    setInterviewData(null);
    setScreen("dashboard");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a", display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16
      }}>
        <div style={{
          fontFamily: "'Orbitron', monospace", fontSize: 24, fontWeight: 900,
          color: "#e8a020", textShadow: "0 0 30px rgba(232,160,32,0.3)"
        }}>CAREERPILOT</div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
          color: "#4a4440", letterSpacing: "0.2em", animation: "pulse 1.5s infinite"
        }}>INITIALIZING SYSTEMS...</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  return (
    <>
      {screen === "login" && <Login onLogin={handleLogin} />}
      {screen === "dashboard" && <Dashboard user={user} onLogout={handleLogout} onStartInterview={() => setScreen("roleSelector")} />}
      {screen === "roleSelector" && <RoleSelector user={user} onBack={() => setScreen("dashboard")} onStart={handleStartInterview} />}
      {screen === "interview" && <InterviewScreen config={interviewConfig} onComplete={handleInterviewComplete} onBack={() => setScreen("roleSelector")} />}
      {screen === "feedback" && <FeedbackScreen data={interviewData} config={interviewConfig} onRestart={handleRestart} />}
    </>
  );
}
