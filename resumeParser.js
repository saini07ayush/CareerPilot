import { callAI } from '../api/aiProvider'

export async function extractTextFromFile(file) {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return extractPDFText(file)
  }
  return file.text()
}

async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
  ).href

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text.replace(/\s{3,}/g, '\n').trim()
}

export async function extractResumeData(rawText) {
  const prompt = `You are a resume parser. Extract structured data from the resume below.
Respond ONLY with valid JSON — no markdown, no explanation.

Resume:
"""
${rawText.substring(0, 4000)}
"""

Return exactly this shape:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "1-2 sentence summary or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "role": "string", "company": "string", "duration": "string", "highlights": "string" }
  ],
  "education": [
    { "degree": "string", "institution": "string", "year": "string" }
  ],
  "projects": [
    { "name": "string", "description": "string", "tech": ["string"] }
  ]
}`

  const raw = await callAI(prompt)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateQuestionsFromResume(resumeData) {
    const prompt = `You are a technical interviewer. Based on this candidate's resume data, generate 5 interview questions tailored specifically to their background.
  
  Resume data:
  ${JSON.stringify(resumeData, null, 2)}
  
  Rules:
  - Mix technical and behavioral questions
  - Reference their actual skills, projects, and experience
  - Make questions specific, not generic
  - Respond ONLY with valid JSON, no markdown
  
  Return exactly this shape:
  {
    "questions": [
      { "question": "string", "type": "technical" | "behavioral", "topic": "what skill/project it targets" }
    ]
  }`
  
    const raw = await callAI(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }