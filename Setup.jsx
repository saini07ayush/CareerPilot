import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import ResumeUpload from '../components/ResumeUpload'

const ROLES = ['Software Engineer','Data Scientist','Product Manager','UX Designer','Business Analyst','DevOps','ML Engineer','Finance','Marketing','Operations','Custom...']

export default function Setup() {
  const nav = useNavigate()
  const [mode, setMode] = useState('Standard')
  const [role, setRole] = useState('Software Engineer')
  const [customRole, setCustomRole] = useState('')
  const [qType, setQType] = useState('Mixed')
  const [jd, setJD] = useState('')
  const [company, setCompany] = useState('')
  const [customCompany, setCustomCompany] = useState('')
  const [count, setCount] = useState(6)
  const [resumeData, setResumeData] = useState(null)
  const [resumeQuestions, setResumeQuestions] = useState([])
  const [processing, setProcessing] = useState(false)
  const [steps, setSteps] = useState([])

  const finalRole = role === 'Custom...' ? customRole : role
  const finalCompany = company === 'Other' ? customCompany : company

  const handleStart = async () => {
    if (!finalRole.trim()) return
    setProcessing(true)

    const allSteps = [
      resumeData ? '📄 Resume parsed successfully...' : null,
      jd ? '📋 Analyzing job description...' : null,
      finalCompany ? `🏢 Loading ${finalCompany} interview patterns...` : null,
      '🎯 Tailoring questions to your profile...',
      '✅ Ready! Starting your interview...',
    ].filter(Boolean)

    for (let i = 0; i < allSteps.length; i++) {
      await new Promise(r => setTimeout(r, 900))
      setSteps(prev => [...prev, allSteps[i]])
    }

    await new Promise(r => setTimeout(r, 600))

    sessionStorage.setItem('interviewConfig', JSON.stringify({
      mode,
      role: finalRole,
      qType,
      jd,
      company: finalCompany,
      count,
      resumeData: resumeData || null,
      resumeQuestions: resumeQuestions || [],
    }))
    nav('/interview')
  }

  if (processing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={spinnerStyle} />
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e8e6f0' }}>Setting up your session</div>
          <div style={{ fontSize: '13px', color: '#8b88a0', marginTop: '6px' }}>
            {finalRole} · {qType} · {mode} · {count} questions
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: '#13121a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#e8e6f0',
              animation: 'fadeIn 0.4s ease',
            }}>
              {step}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        `}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8e6f0' }}>CareerPilot</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => nav('/dashboard')} style={ghostBtn}>Dashboard</button>
            <button onClick={() => signOut(auth).then(() => nav('/login'))} style={ghostBtn}>Logout</button>
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e8e6f0', marginBottom: '0.4rem' }}>Set up your session</h2>
        <p style={{ color: '#8b88a0', fontSize: '14px', marginBottom: '1.5rem' }}>Configure your mock interview before we begin.</p>

        {/* Interview Format */}
        <Section label="Interview Format">
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Standard', 'HireVue'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={pillBtn(mode === m)}>
                <div style={{ fontWeight: 500 }}>{m}</div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                  {m === 'Standard' ? 'Conversational + follow-ups' : 'Timed, one-shot answers'}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Target Role */}
        <Section label="Target Role">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)} style={chipBtn(role === r)}>{r}</button>
            ))}
          </div>
          {role === 'Custom...' && (
            <input
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              placeholder="Enter your role..."
              style={{ ...inputStyle, marginTop: '12px' }}
            />
          )}
        </Section>

        {/* Target Company */}
        <Section label="Target Company (optional)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: company === 'Other' ? '10px' : '0' }}>
            {['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Other'].map(c => (
              <button key={c} onClick={() => setCompany(company === c ? '' : c)} style={chipBtn(company === c)}>{c}</button>
            ))}
          </div>
          {company === 'Other' && (
            <input
              value={customCompany}
              onChange={e => setCustomCompany(e.target.value)}
              placeholder="Enter company name..."
              style={inputStyle}
            />
          )}
          {company && company !== 'Other' && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#8b88a0', background: '#1c1b26', borderRadius: '8px', padding: '8px 12px' }}>
              {company === 'Amazon' && '💡 Questions will focus on Amazon Leadership Principles'}
              {company === 'Google' && '💡 Questions will focus on system design, algorithms and Googleyness'}
              {company === 'Microsoft' && '💡 Questions will focus on growth mindset and collaboration'}
              {company === 'Meta' && '💡 Questions will focus on impact at scale and data-driven decisions'}
              {company === 'Apple' && '💡 Questions will focus on attention to detail and user experience'}
            </div>
          )}
        </Section>

        {/* Question Type */}
        <Section label="Question Type">
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Mixed', 'Technical', 'Behavioral'].map(t => (
              <button key={t} onClick={() => setQType(t)} style={chipBtn(qType === t)}>{t}</button>
            ))}
          </div>
        </Section>

        {/* Number of Questions */}
        <Section label="Number of Questions">
          <div style={{ display: 'flex', gap: '8px' }}>
            {[3, 5, 6, 8, 10].map(n => (
              <button key={n} onClick={() => setCount(n)} style={chipBtn(count === n)}>{n}</button>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#8b88a0', marginTop: '10px' }}>
            {count <= 3 ? 'Quick practice — great for a fast session' : count <= 6 ? 'Standard session — recommended' : 'Deep dive — full interview simulation'}
          </div>
        </Section>

        {/* Job Description */}
        <Section label="Job Description (optional)">
          <textarea
            value={jd}
            onChange={e => setJD(e.target.value)}
            placeholder="Paste the job description here. AI will tailor questions to this role..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
          />
        </Section>

        {/* Resume Upload */}
        <Section label="Resume Upload (optional)">
          <ResumeUpload
            onExtracted={(data) => setResumeData(data)}
            onQuestionsGenerated={(qs, data) => {
              setResumeQuestions(qs)
              setResumeData(data)
            }}
          />
        </Section>

        {/* Session summary */}
        <div style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#8b88a0' }}>Session:</span>
          <span style={summaryBadge('#7c6af7')}>{finalRole || 'No role'}</span>
          <span style={summaryBadge('#8b88a0')}>{mode}</span>
          <span style={summaryBadge('#8b88a0')}>{qType}</span>
          <span style={summaryBadge('#8b88a0')}>{count} questions</span>
          {finalCompany && <span style={summaryBadge('#4fd1a5')}>{finalCompany}</span>}
          {jd && <span style={summaryBadge('#4fd1a5')}>JD ✓</span>}
          {resumeData && <span style={summaryBadge('#4fd1a5')}>Resume ✓</span>}
        </div>

        <button
          onClick={handleStart}
          disabled={!finalRole.trim()}
          style={{ ...btnStart, opacity: !finalRole.trim() ? 0.5 : 1 }}
        >
          Start Interview →
        </button>

      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '12px', fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  )
}

const spinnerStyle = {
  width: '48px', height: '48px', border: '3px solid #1c1b26',
  borderTop: '3px solid #7c6af7', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem',
}
const pillBtn = (sel) => ({
  flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
  border: `1px solid ${sel ? '#7c6af7' : 'rgba(255,255,255,0.1)'}`,
  background: sel ? 'rgba(124,106,247,0.08)' : 'transparent',
  color: sel ? '#7c6af7' : '#8b88a0', cursor: 'pointer', fontSize: '14px',
})
const chipBtn = (sel) => ({
  padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
  border: `1px solid ${sel ? '#4fd1a5' : 'rgba(255,255,255,0.1)'}`,
  background: sel ? 'rgba(79,209,165,0.08)' : 'transparent',
  color: sel ? '#4fd1a5' : '#8b88a0',
})
const inputStyle = {
  width: '100%', background: '#1c1b26', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '10px 14px', color: '#e8e6f0', fontSize: '14px',
  outline: 'none', fontFamily: 'inherit',
}
const ghostBtn = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', padding: '7px 14px', color: '#8b88a0', fontSize: '13px', cursor: 'pointer',
}
const btnStart = {
  width: '100%', background: '#7c6af7', color: 'white', border: 'none',
  borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 500,
  cursor: 'pointer', marginTop: '0.5rem',
}
const summaryBadge = (color) => ({
  padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
  background: color + '18', color, border: `1px solid ${color}44`,
})