const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Groq API error')
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''
  return raw.replace(/```json|```/g, '').trim()
}

export async function generateQuestions({ role, questionType = 'Mixed', jd = '', count = 6, resumeData = null, company = '' }) {
  const companyContext = company ? `
Target company: ${company}
${company === 'Amazon' ? 'Focus on Amazon Leadership Principles: ownership, customer obsession, dive deep, deliver results.' : ''}
${company === 'Google' ? 'Focus on system design, scalability, algorithms, and Googleyness.' : ''}
${company === 'Microsoft' ? 'Focus on growth mindset, collaboration, and problem solving.' : ''}
${company === 'Meta' ? 'Focus on impact at scale, data-driven decisions, and moving fast.' : ''}
${company === 'Apple' ? 'Focus on attention to detail, user experience, and quality.' : ''}
At least 3 questions must reflect ${company} interview style.` : ''

  const resumeContext = resumeData ? `
Candidate resume:
- Name: ${resumeData.name}
- Current role: ${resumeData.currentRole}
- Skills: ${resumeData.skills?.join(', ')}
- Projects: ${resumeData.projects?.map(p => `${p.name} (${p.tech?.join(', ')})`).join(', ')}
- Experience: ${resumeData.experience?.map(e => `${e.role} at ${e.company}`).join(', ')}
Reference candidate's actual projects and skills in at least 3 questions.` : ''

  const system = `You are an expert interviewer. Return ONLY a valid JSON array, no markdown, no explanation.`

  const user = `Generate exactly ${count} interview questions for a ${role} role.
Question type: ${questionType}.
${jd ? `Job Description: ${jd}` : ''}
${companyContext}
${resumeContext}
Return ONLY a JSON array:
[{ "question": "...", "type": "Behavioral|Technical|Situational", "focus": "short topic label" }]`

  const raw = await callGroq(system, user)
  return JSON.parse(raw)
}

export async function evaluateAnswer({ question, answer, role }) {
  const system = `You are an expert interviewer. Return ONLY a valid JSON object, no markdown, no explanation.`

  const user = `Evaluate this answer for a ${role} role.
Question: "${question}"
Answer: "${answer}"

Return ONLY this JSON:
{
  "score": <1-10>,
  "verdict": "Strong" | "Good" | "Needs Work",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "betterAnswer": "2-3 sentence improved version in first person",
  "confidenceScore": <1-10>,
  "starScore": { "situation": true|false, "task": true|false, "action": true|false, "result": true|false }
}`

  const raw = await callGroq(system, user)
  return JSON.parse(raw)
}

export async function generateSessionSummary({ role, results }) {
  const scores = results.map(r => r.feedback?.score || 5)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const overallScore = Math.round(avgScore * 10)
  const readiness = avgScore >= 7.5 ? 'Ready to Interview' : avgScore >= 5.5 ? 'Almost There' : 'Needs More Practice'

  // Collect all strengths and improvements from individual answers
  const allStrengths = results.flatMap(r => r.feedback?.strengths || [])
  const allImprovements = results.flatMap(r => r.feedback?.improvements || [])

  return {
    overallScore,
    readiness,
    topStrengths: allStrengths.slice(0, 3),
    topImprovements: allImprovements.slice(0, 3),
    nextSteps: [
      `Practice more ${role} specific questions daily`,
      'Use the STAR method for all behavioral answers',
      'Record yourself to improve delivery and reduce filler words',
    ],
  }
}

export async function parseResume(file) {
  const text = await extractTextFromPDF(file)

  const system = `You are a resume parser. Return ONLY a valid JSON object, no markdown, no explanation.`

  const user = `Extract from this resume:
${text}

Return ONLY this JSON:
{
  "name": "candidate name",
  "currentRole": "most recent role",
  "skills": ["skill1", "skill2"],
  "experience": [{ "role": "...", "company": "...", "highlights": ["..."] }],
  "projects": [{ "name": "...", "tech": ["..."], "description": "..." }],
  "education": "degree and institution"
}`

  const raw = await callGroq(system, user)
  return JSON.parse(raw)
}

async function extractTextFromPDF(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const cleaned = text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim()
      resolve(cleaned.slice(0, 3000))
    }
    reader.readAsText(file)
  })
}

export async function generateFollowUp({ question, answer, role }) {
  const system = `You are an expert interviewer. Return ONLY a valid JSON object, no markdown, no explanation.`

  const user = `A candidate for a ${role} role just answered this question:

Question: "${question}"
Answer: "${answer}"

Generate ONE smart follow-up question that digs deeper into their answer.
Rules:
- Reference something specific they mentioned
- Don't repeat the original question
- Make it natural like a real interviewer would ask

Return ONLY this JSON:
{
  "question": "the follow-up question",
  "type": "Technical" | "Behavioral" | "Situational",
  "focus": "short topic label"
}`

  const raw = await callGroq(system, user)
  return JSON.parse(raw)
}