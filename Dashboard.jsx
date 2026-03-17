import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { getUserSessions } from '../lib/firestore'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserSessions(user.uid)
      .then(setSessions)
      .finally(() => setLoading(false))
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    nav('/login')
  }

  const avg = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + (x.score || 0), 0) / sessions.length)
    : 0
  const best = sessions.length ? Math.max(...sessions.map(s => s.score || 0)) : 0
  const ready = sessions.filter(s => s.score >= 75).length

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8e6f0' }}>CareerPilot</div>
            <div style={{ fontSize: '12px', color: '#8b88a0', marginTop: '2px' }}>{user?.email}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => nav('/')} style={ghostBtn}>Practice</button>
            <button onClick={handleLogout} style={ghostBtn}>Logout</button>
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8e6f0', marginBottom: '0.4rem' }}>Your Progress</h2>
        <p style={{ color: '#8b88a0', fontSize: '14px', marginBottom: '1.5rem' }}>Track your improvement across sessions.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '2rem' }}>
          {[
            { val: sessions.length, label: 'Sessions', color: '#e8e6f0' },
            { val: avg, label: 'Avg score', color: '#7c6af7' },
            { val: best, label: 'Best score', color: '#4fd1a5' },
            { val: ready, label: 'Interview ready', color: '#f5a623' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.2rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#8b88a0', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Session history */}
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e6f0', marginBottom: '1rem' }}>Session history</div>

        {loading ? (
          <div style={{ color: '#8b88a0', fontSize: '13px', padding: '2rem', textAlign: 'center' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <div style={{ color: '#8b88a0', fontSize: '14px', marginBottom: '1.5rem' }}>No sessions yet. Start your first mock interview!</div>
            <button onClick={() => nav('/')} style={{ ...ghostBtn, background: '#7c6af7', color: 'white', borderColor: '#7c6af7', padding: '10px 24px' }}>
              Start practicing
            </button>
          </div>
        ) : (
          sessions.map((s, i) => (
            <div key={s.id || i} style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: scoreColor(s.score) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: scoreColor(s.score) }}>
                  {s.score}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '15px', color: '#e8e6f0' }}>{s.role}</div>
                  <div style={{ fontSize: '12px', color: '#8b88a0', marginTop: '3px' }}>
                    {s.mode} · {s.questionCount} questions · {s.readiness}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: scoreColor(s.score) }}>{s.score}</div>
                <div style={{ fontSize: '11px', color: '#8b88a0' }}>/ 100</div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

function scoreColor(score) {
  if (score >= 75) return '#4fd1a5'
  if (score >= 55) return '#f5a623'
  return '#f4736a'
}

const ghostBtn = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', padding: '7px 14px', color: '#8b88a0', fontSize: '13px', cursor: 'pointer',
}