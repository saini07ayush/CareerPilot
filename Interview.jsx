import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuestions, evaluateAnswer, generateFollowUp } from '../lib/gemini'
import { useSpeech } from '../hooks/useSpeech'

export default function Interview() {
  const nav = useNavigate()
  const config = JSON.parse(sessionStorage.getItem('interviewConfig') || '{}')

  const [stage, setStage] = useState('processing')
  const [processingMsg, setProcessingMsg] = useState('Setting up your interview...')
  const [questions, setQuestions] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [showTip, setShowTip] = useState(false)
  const [followUpDone, setFollowUpDone] = useState(false)

  const handleTranscript = useCallback((t) => setAnswer(t), [])
  const { listening, toggle } = useSpeech(handleTranscript)

  useEffect(() => {
    if (!config.role) { nav('/'); return }
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const questionCount = config.count || 6
      const resumeQs = config.resumeQuestions || []

      if (resumeQs.length > 0) {
        setProcessingMsg('Loading your personalized resume questions...')
        await new Promise(r => setTimeout(r, 800))
        const formatted = resumeQs.map(q => ({
          question: q.question,
          type: q.type === 'technical' ? 'Technical' : 'Behavioral',
          focus: q.topic,
        }))
        setQuestions(formatted.slice(0, questionCount))
        setStage('interview')
        return
      }

      if (config.jd) {
        setProcessingMsg('Tailoring questions to the job description...')
      } else if (config.company) {
        setProcessingMsg(`Loading ${config.company} interview patterns...`)
      } else {
        setProcessingMsg(`Generating ${questionCount} questions for ${config.role}...`)
      }

      const qs = await generateQuestions({
        role: config.role,
        questionType: config.qType,
        jd: config.jd,
        count: questionCount,
        resumeData: null,
        company: config.company || '',
      })

      setQuestions(qs.slice(0, questionCount))
      setStage('interview')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setStage('evaluating')
    try {
      const feedback = await evaluateAnswer({
        question: questions[qIdx].question,
        answer,
        role: config.role,
      })

      const updated = [...results, { ...questions[qIdx], answer, feedback }]
      setResults(updated)
      setAnswer('')
      setShowTip(false)

      const isLastQuestion = qIdx + 1 >= questions.length

      if (isLastQuestion) {
        sessionStorage.setItem('interviewResults', JSON.stringify({ results: updated, config }))
        nav('/results')
      } else {
        // Only generate ONE follow-up per session
        if (!followUpDone) {
          setStage('followup')
          try {
            const followUp = await generateFollowUp({
              question: questions[qIdx].question,
              answer,
              role: config.role,
            })
            const updatedQs = [...questions]
            updatedQs[qIdx + 1] = followUp
            setQuestions(updatedQs)
            setFollowUpDone(true)
          } catch (e) {
            console.log('Follow-up failed, using original question')
          }
        }
        setQIdx(q => q + 1)
        setStage('interview')
      }
    } catch (e) {
      setError('Evaluation failed: ' + e.message)
      setStage('interview')
    }
  }

  const words = answer.trim().split(/\s+/).filter(Boolean).length
  const progress = questions.length ? (qIdx / questions.length) * 100 : 0
  const isResumeMode = (config.resumeQuestions || []).length > 0

  if (stage === 'processing') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem' }}>
        <div style={spinnerStyle('#7c6af7')} />
        <div style={{ color: '#e8e6f0', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{processingMsg}</div>
        <div style={{ color: '#8b88a0', fontSize: '13px' }}>
          {isResumeMode ? 'Using your resume questions' : `${config.count || 6} questions · ${config.role} · ${config.qType}`}
          {config.company ? ` · ${config.company}` : ''}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (stage === 'evaluating' || stage === 'followup') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={spinnerStyle('#4fd1a5')} />
        <div style={{ color: '#e8e6f0', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
          {stage === 'followup' ? 'Generating follow-up question...' : 'Evaluating your answer...'}
        </div>
        <div style={{ color: '#8b88a0', fontSize: '13px' }}>Q{qIdx + 1} of {questions.length}</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <div style={{ color: '#f4736a', fontSize: '15px', marginBottom: '0.5rem' }}>Something went wrong</div>
        <div style={{ color: '#8b88a0', fontSize: '13px', marginBottom: '1.5rem' }}>{error}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => { setError(''); setStage('processing'); loadQuestions() }} style={ghostBtn}>Try again</button>
          <button onClick={() => nav('/')} style={{ ...ghostBtn, color: '#e8e6f0' }}>Back to setup</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ height: '3px', background: '#1c1b26', borderRadius: '2px', marginBottom: '2rem' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #7c6af7, #4fd1a5)', borderRadius: '2px', transition: 'width 0.4s' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={badge('#1c1b26', '#8b88a0')}>Q {qIdx + 1} / {questions.length}</span>
            <span style={badge('rgba(124,106,247,0.1)', '#7c6af7')}>{config.role}</span>
            {isResumeMode
              ? <span style={badge('rgba(79,209,165,0.1)', '#4fd1a5')}>Resume mode</span>
              : <>
                  <span style={badge('rgba(124,106,247,0.1)', '#7c6af7')}>{config.qType}</span>
                  {config.company && <span style={badge('rgba(79,209,165,0.1)', '#4fd1a5')}>{config.company}</span>}
                  {config.jd && <span style={badge('rgba(79,209,165,0.1)', '#4fd1a5')}>JD ✓</span>}
                </>
            }
            {followUpDone && qIdx > 0 && <span style={badge('rgba(245,166,35,0.1)', '#f5a623')}>Follow-up</span>}
          </div>
          <button onClick={() => nav('/')} style={ghostBtn}>Exit</button>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c6af7', fontWeight: 500 }}>
              {questions[qIdx]?.type} · {questions[qIdx]?.focus}
            </div>
            <button
              onClick={() => setShowTip(!showTip)}
              style={{ fontSize: '11px', color: '#8b88a0', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {showTip ? 'Hide tip' : 'Show tip'}
            </button>
          </div>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: '#e8e6f0' }}>
            {questions[qIdx]?.question}
          </p>
          {showTip && (
            <div style={{ marginTop: '1rem', background: '#1c1b26', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#8b88a0', borderLeft: '3px solid #7c6af7' }}>
              {questions[qIdx]?.type === 'Behavioral'
                ? '💡 Use the STAR method: Situation → Task → Action → Result'
                : questions[qIdx]?.type === 'Technical'
                ? '💡 Think out loud, explain your reasoning step by step'
                : '💡 Be specific — give a real example from your experience'}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div style={{ background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '10px', fontWeight: 500 }}>Previous answers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: scoreColor(r.feedback?.score) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: scoreColor(r.feedback?.score), flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: '12px', color: '#8b88a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.question}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: scoreColor(r.feedback?.score), flexShrink: 0 }}>
                    {r.feedback?.score}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b88a0', marginBottom: '12px', fontWeight: 500 }}>Your answer</div>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer here, or click the mic to speak..."
            rows={6}
            style={{
              width: '100%', background: '#1c1b26',
              border: `1px solid ${answer.trim() ? 'rgba(124,106,247,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#e8e6f0', fontSize: '14px',
              outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', transition: 'border-color 0.2s',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#8b88a0' }}>{words} words</span>
              {words > 0 && words < 30 && <span style={{ fontSize: '12px', color: '#f5a623' }}>Too short</span>}
              {words >= 30 && words < 150 && <span style={{ fontSize: '12px', color: '#4fd1a5' }}>Good length</span>}
              {words >= 150 && <span style={{ fontSize: '12px', color: '#7c6af7' }}>Detailed</span>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={toggle}
                style={{
                  ...ghostBtn,
                  color: listening ? '#f4736a' : '#8b88a0',
                  borderColor: listening ? 'rgba(244,115,106,0.4)' : 'rgba(255,255,255,0.12)',
                  background: listening ? 'rgba(244,115,106,0.08)' : 'transparent',
                }}
              >
                {listening ? '⏹ Stop' : '🎤 Mic'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                style={{
                  ...ghostBtn,
                  background: answer.trim() ? '#7c6af7' : '#1c1b26',
                  color: answer.trim() ? 'white' : '#8b88a0',
                  borderColor: answer.trim() ? '#7c6af7' : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.2s',
                }}
              >
                {qIdx + 1 >= questions.length ? 'Finish →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i < qIdx ? '#4fd1a5' : i === qIdx ? '#7c6af7' : '#1c1b26',
              border: `1px solid ${i === qIdx ? '#7c6af7' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.3s',
            }} />
          ))}
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

const spinnerStyle = (color) => ({
  width: '48px', height: '48px', border: '3px solid #1c1b26',
  borderTop: `3px solid ${color}`, borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem',
})
const card = { background: '#13121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }
const ghostBtn = { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 16px', color: '#8b88a0', fontSize: '13px', cursor: 'pointer' }
const badge = (bg, color) => ({ background: bg, color, border: `1px solid ${color}44`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px' })