import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSession } from '../lib/firestore'
import { useAuth } from '../context/AuthContext'

export default function Results() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [activeQ, setActiveQ] = useState(null)
  const stored = JSON.parse(sessionStorage.getItem('interviewResults') || '{}')
  const { results = [], config = {} } = stored
  const hasResume = !!config.resumeData

  useEffect(() => {
    if (!results.length) { nav('/'); return }

    const scores = results.map(r => r.feedback?.score || 5)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const overallScore = Math.round(avgScore * 10)
    const allStrengths = results.flatMap(r => r.feedback?.strengths || [])
    const allImprovements = results.flatMap(r => r.feedback?.improvements || [])

    const s = {
      overallScore,
      readiness: avgScore >= 7.5 ? 'Ready to Interview' : avgScore >= 5.5 ? 'Almost There' : 'Needs More Practice',
      topStrengths: allStrengths.slice(0, 3).length
        ? allStrengths.slice(0, 3)
        : ['Good effort throughout', 'Completed all questions', 'Showed role knowledge'],
      topImprovements: allImprovements.slice(0, 3).length
        ? allImprovements.slice(0, 3)
        : ['Add specific examples', 'Quantify achievements', 'Use STAR format'],
      nextSteps: [
        `Practice more ${config.role} questions daily`,
        'Use STAR method for all behavioral answers',
        'Record yourself to improve delivery and reduce filler words',
      ],
    }

    setSummary(s)

    if (user) {
      saveSession(user.uid, {
        role: config.role,
        mode: config.mode || 'Standard',
        score: s.overallScore,
        readiness: s.readiness,
        questionCount: results.length,
        company: config.company || '',
      })
    }
  }, [])

  if (!summary) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={spinnerStyle} />
        <div style={{ color: '#e8e6f0', fontSize: '1.1rem' }}>Calculating your results...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  const verdictColor = summary.readiness === 'Ready to Interview' ? '#4fd1a5'
    : summary.readiness === 'Almost There' ? '#f5a623' : '#f4736a'

  // Resume scorer metrics
  const resumeMetrics = hasResume ? [
    { label: 'Skills match', score: Math.min(10, config.resumeData.skills?.length || 0) },
    { label: 'Experience', score: Math.min(10, (config.resumeData.experience?.length || 0) * 3) },
    { label: 'Projects', score: Math.min(10, (config.resumeData.projects?.length || 0) * 3) },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Score hero */}
        <div style={{ ...card, textAlign: 'center', padding: '2.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '0.75rem' }}>Overall Score</div>
          <div style={{ fontSize: '5rem', fontWeight: 700, color: '#7c6af7', lineHeight: 1 }}>
            {summary.overallScore}
            <span style={{ fontSize: '1.8rem', color: '#8b88a0' }}>/100</span>
          </div>
          <div style={{ color: '#8b88a0', fontSize: '13px', marginTop: '8px' }}>
            {config.role} · {config.mode || 'Standard'} Mode
            {config.company ? ` · ${config.company}` : ''}
            {hasResume ? ' · Resume mode' : ''}
          </div>
          <div style={{
            display: 'inline-block', marginTop: '1rem', padding: '7px 20px',
            borderRadius: '20px', fontSize: '13px', fontWeight: 500,
            background: verdictColor + '18', color: verdictColor, border: `1px solid ${verdictColor}44`,
          }}>
            {summary.readiness}
          </div>
          <div style={{ height: '6px', background: '#1c1b26', borderRadius: '3px', marginTop: '1.5rem' }}>
            <div style={{ height: '100%', width: `${summary.overallScore}%`, background: verdictColor, borderRadius: '3px' }} />
          </div>

          {/* Resume scorer */}
          {hasResume && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '1rem', textAlign: 'left' }}>Resume score</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {resumeMetrics.map((m, i) => (
                  <div key={i} style={{ background: '#1c1b26', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7c6af7' }}>{m.score}/10</div>
                    <div style={{ fontSize: '11px', color: '#8b88a0', marginTop: '4px' }}>{m.label}</div>
                    <div style={{ height: '4px', background: '#13121a', borderRadius: '2px', marginTop: '8px' }}>
                      <div style={{ height: '100%', width: `${m.score * 10}%`, background: '#7c6af7', borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
              {config.resumeData?.summary && (
                <div style={{ marginTop: '10px', background: '#1c1b26', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#8b88a0', lineHeight: 1.6, textAlign: 'left' }}>
                  {config.resumeData.summary}
                </div>
              )}
              {config.resumeData?.name && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8b88a0', textAlign: 'left' }}>
                  Candidate: <span style={{ color: '#e8e6f0' }}>{config.resumeData.name}</span>
                  {config.resumeData.email && <span> · {config.resumeData.email}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={card}>
            <div style={sectionLabel}>Top Strengths</div>
            {summary.topStrengths.map((s, i) => (
              <div key={i} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', lineHeight: 1.5 }}>
                <span style={{ color: '#4fd1a5', fontWeight: 700, flexShrink: 0 }}>+</span>{s}
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={sectionLabel}>Areas to Improve</div>
            {summary.topImprovements.map((s, i) => (
              <div key={i} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', lineHeight: 1.5 }}>
                <span style={{ color: '#f5a623', fontWeight: 700, flexShrink: 0 }}>→</span>{s}
              </div>
            ))}
          </div>
        </div>

        {/* Per question breakdown */}
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e6f0', marginBottom: '1rem' }}>Per-question breakdown</div>
        {results.map((r, i) => (
          <div key={i} style={{ ...card, marginBottom: '10px', cursor: 'pointer' }} onClick={() => setActiveQ(activeQ === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, marginRight: '1rem' }}>
                <div style={{ fontSize: '13px', color: '#8b88a0', marginBottom: '8px' }}>Q{i + 1}: {r.question}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '5px', background: '#1c1b26', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${(r.feedback?.score || 0) * 10}%`, background: scoreColor(r.feedback?.score), borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: scoreColor(r.feedback?.score), minWidth: '35px' }}>{r.feedback?.score}/10</span>
                  <span style={{ fontSize: '11px', color: '#8b88a0' }}>{r.feedback?.verdict}</span>
                </div>
              </div>
              <div style={{ color: '#8b88a0', fontSize: '12px', flexShrink: 0 }}>{activeQ === i ? '▲' : '▼'}</div>
            </div>

            {activeQ === i && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>

                {/* Confidence + STAR */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {r.feedback?.confidenceScore && (
                    <span style={metricBadge('#7c6af7')}>Confidence: {r.feedback.confidenceScore}/10</span>
                  )}
                  {r.feedback?.starScore && (
                    <>
                      <span style={metricBadge(r.feedback.starScore.situation ? '#4fd1a5' : '#f4736a')}>S {r.feedback.starScore.situation ? '✓' : '✗'}</span>
                      <span style={metricBadge(r.feedback.starScore.task ? '#4fd1a5' : '#f4736a')}>T {r.feedback.starScore.task ? '✓' : '✗'}</span>
                      <span style={metricBadge(r.feedback.starScore.action ? '#4fd1a5' : '#f4736a')}>A {r.feedback.starScore.action ? '✓' : '✗'}</span>
                      <span style={metricBadge(r.feedback.starScore.result ? '#4fd1a5' : '#f4736a')}>R {r.feedback.starScore.result ? '✓' : '✗'}</span>
                    </>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#4fd1a5', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</div>
                    {(r.feedback?.strengths || []).map((s, j) => (
                      <div key={j} style={{ fontSize: '12px', color: '#8b88a0', padding: '3px 0' }}>+ {s}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#f5a623', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Improvements</div>
                    {(r.feedback?.improvements || []).map((s, j) => (
                      <div key={j} style={{ fontSize: '12px', color: '#8b88a0', padding: '3px 0' }}>→ {s}</div>
                    ))}
                  </div>
                </div>

                {r.feedback?.betterAnswer && (
                  <div style={{ background: '#1c1b26', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#8b88a0', fontStyle: 'italic', lineHeight: 1.6, borderLeft: '3px solid #7c6af7', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#7c6af7', marginBottom: '6px', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Better answer</div>
                    {r.feedback.betterAnswer}
                  </div>
                )}

                <div style={{ background: '#1c1b26', borderRadius: '8px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#8b88a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your answer</div>
                  <div style={{ fontSize: '13px', color: '#8b88a0', lineHeight: 1.6 }}>{r.answer}</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Next steps */}
        <div style={{ ...card, marginTop: '1.5rem' }}>
          <div style={sectionLabel}>Next Steps</div>
          {summary.nextSteps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', padding: '7px 0', alignItems: 'flex-start', borderBottom: i < summary.nextSteps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ background: 'rgba(124,106,247,0.15)', color: '#7c6af7', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0, marginTop: '1px' }}>{i + 1}</div>
              <div style={{ color: '#e8e6f0', lineHeight: 1.5 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button onClick={() => nav('/')} style={{ ...ghostBtn, flex: 1, padding: '12px', fontSize: '14px', textAlign: 'center' }}>
            Practice again
          </button>
          <button onClick={() => nav('/dashboard')} style={{ ...ghostBtn, flex: 1, padding: '12px', fontSize: '14px', background: '#7c6af7', color: 'white', borderColor: '#7c6af7', textAlign: 'center' }}>
            View Dashboard →
          </button>
        </div>

      </div>
    </div>
  )
}

function scoreColor(score) {
  if (score >= 8) return '#4fd1a5'
  if (score >= 5) return '#f5a623'
  return '#f4736a'
}

const spinnerStyle = {
  width: '48px', height: '48px', border: '3px solid #1c1b26',
  borderTop: '3px solid #7c6af7', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem',
}
const card = { background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }
const sectionLabel = { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '12px', fontWeight: 500 }
const ghostBtn = { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 16px', color: '#8b88a0', fontSize: '13px', cursor: 'pointer' }
const metricBadge = (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: color + '18', color, border: `1px solid ${color}44` })