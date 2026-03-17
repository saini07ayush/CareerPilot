import { useState } from 'react'
import { extractTextFromFile, extractResumeData, generateQuestionsFromResume } from '../utils/resumeParser'

export default function ResumeUpload({ onExtracted }) {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])

  async function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    setError('')
    setData(null)
    setStatus('reading')

    try {
      const text = await extractTextFromFile(file)
      setStatus('extracting')
      const extracted = await extractResumeData(text)
      setData(extracted)
      setStatus('done')
      onExtracted?.(extracted)
      const q = await generateQuestionsFromResume(extracted)
      setQuestions(q.questions)
    } catch (err) {
      console.error(err)
      setError('Could not parse. Try again.')
      setStatus('error')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  function reset() {
    setStatus('idle')
    setFileName('')
    setData(null)
    setError('')
    setQuestions([])
  }

  if (status === 'idle') return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => document.getElementById('_resume_input').click()}
      style={{ border: '2px dashed #ccc', borderRadius: 10, padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
    >
      <p style={{ fontWeight: 500, margin: 0 }}>Drop resume here or click to upload</p>
      <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>PDF or TXT</p>
      <input
        id="_resume_input"
        type="file"
        accept=".pdf,.txt"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )

  if (status === 'reading' || status === 'extracting') return (
    <p style={{ fontSize: 14, color: '#555' }}>
      {status === 'reading' ? `Reading ${fileName}...` : 'Extracting with AI...'}
    </p>
  )

  if (status === 'error') return (
    <div>
      <p style={{ color: 'red', fontSize: 14 }}>{error}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: 13, color: 'green' }}>✓ Parsed — {fileName}</p>
      <pre style={{ fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 300, textAlign: 'left' }}>
        {JSON.stringify(data, null, 2)}
      </pre>

      {questions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>Generated questions</p>
          {questions.map((q, i) => (
            <div key={i} style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 14 }}>{q.question}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>{q.type} · {q.topic}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={reset} style={{ fontSize: 13, marginTop: 8 }}>
        Upload different resume
      </button>
    </div>
  )
}