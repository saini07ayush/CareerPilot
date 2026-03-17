// src/lib/resumeParser.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Converts a File object to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts structured info from a resume PDF using Gemini vision
 */
export async function parseResume(file) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const base64 = await fileToBase64(file);

  const prompt = `Extract structured information from this resume. Return ONLY valid JSON, no markdown, no backticks:
{
  "name": "<full name>",
  "currentRole": "<current or most recent job title>",
  "skills": ["<skill1>", "<skill2>", ...],
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "duration": "<e.g. Jan 2022 - Present>",
      "highlights": ["<key achievement or responsibility>"]
    }
  ],
  "education": [
    {
      "degree": "<degree name>",
      "institution": "<school name>",
      "year": "<graduation year>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<1-2 sentence description>",
      "technologies": ["<tech1>", "<tech2>"]
    }
  ],
  "summary": "<2-3 sentence professional summary synthesized from the resume>"
}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: file.type || "application/pdf",
        data: base64,
      },
    },
    prompt,
  ]);

  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/**
 * Generates resume-aware interview questions
 */
export async function generateResumeAwareQuestions({ resumeData, role, jobDescription, mode }) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const count = mode === "hirevue" ? 5 : 6;

  const prompt = `You are an expert interviewer. Generate exactly ${count} highly personalized interview questions based on THIS SPECIFIC candidate's resume.

Target Role: ${role}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Candidate Resume Summary:
- Name: ${resumeData.name}
- Skills: ${resumeData.skills?.join(", ")}
- Recent Experience: ${resumeData.experience?.[0]?.title} at ${resumeData.experience?.[0]?.company}
- Projects: ${resumeData.projects?.map(p => p.name).join(", ")}
- Summary: ${resumeData.summary}

${mode === "hirevue"
    ? "Generate behavioral/situational questions suited for async HireVue format. Reference specific items from their resume (projects, roles, skills) to make questions feel personalized. Each should be answerable with STAR method in 60-90 seconds."
    : "Mix technical and behavioral questions. Directly reference their specific projects, technologies, and experience. Ask about things on their actual resume."
  }

Rules:
- Reference their actual project names, companies, or technologies by name
- Don't ask generic questions — make each one specific to this candidate
- Progressively increase difficulty

Return ONLY a valid JSON array of strings. No explanation, no markdown, no backticks.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
