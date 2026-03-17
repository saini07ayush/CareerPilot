// src/lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const getModel = () =>
  genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// ─── Regular Interview ────────────────────────────────────────────────────────

export async function generateInterviewQuestions({ role, jobDescription, mode }) {
  const model = getModel();
  const count = mode === "hirevue" ? 5 : 6;

  const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for the following:

Role: ${role}
${jobDescription ? `Job Description: ${jobDescription}` : ""}
Mode: ${mode === "hirevue" ? "HireVue async one-way video interview" : "Standard conversational interview"}

${mode === "hirevue"
    ? "Focus on behavioral questions suitable for async one-way video format. Each question should be answerable as a standalone 60-90 second response using the STAR method."
    : "Mix of technical, behavioral, and situational questions. Start with an icebreaker."
  }

Return ONLY a valid JSON array of strings. No explanation, no markdown, no backticks.
Example: ["Question 1?", "Question 2?"]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function generateFollowUp({ role, question, answer }) {
  const model = getModel();

  const prompt = `You are interviewing a candidate for a ${role} position.

Original question: "${question}"
Candidate's answer: "${answer}"

Generate ONE sharp follow-up question that probes deeper into their answer, challenges an assumption, or asks for a specific example they mentioned. Keep it concise (1-2 sentences max).

Return ONLY the follow-up question as plain text. No explanation.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function evaluateAnswer({ role, question, answer, isFollowUp = false }) {
  const model = getModel();

  const prompt = `You are an expert interviewer evaluating a candidate for a ${role} position.

Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate this answer and return ONLY valid JSON (no markdown, no backticks):
{
  "score": <number 1-10>,
  "verdict": "<Excellent|Good|Needs Work|Poor>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "betterAnswer": "<A concise example of how to improve this answer in 2-3 sentences>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── HireVue Mode ─────────────────────────────────────────────────────────────

export async function evaluateHireVueAnswer({ role, question, answer, timeUsed, timeAllowed }) {
  const model = getModel();

  const fillerWords = ["um", "uh", "like", "basically", "you know", "literally", "kind of", "sort of", "right", "okay so"];
  const lowerAnswer = answer.toLowerCase();
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerAnswer.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const fillerRate = wordCount > 0 ? ((fillerCount / wordCount) * 100).toFixed(1) : 0;

  const prompt = `You are evaluating a HireVue-style async video interview response for a ${role} position.

Question: "${question}"
Candidate's Answer: "${answer}"
Time Used: ${timeUsed}s out of ${timeAllowed}s allowed
Filler Words Detected: ${fillerCount} (${fillerRate}% of ${wordCount} words)

Evaluate strictly using these criteria:
1. STAR Method adherence (Situation, Task, Action, Result)
2. Answer quality, relevance, and depth
3. Communication clarity (penalize high filler word usage)
4. Time management (using 70-100% of time is ideal)
5. Overall HireVue readiness

Return ONLY valid JSON (no markdown, no backticks):
{
  "scores": {
    "star": <0-25>,
    "quality": <0-25>,
    "communication": <0-25>,
    "timeManagement": <0-25>
  },
  "overall": <0-100>,
  "readinessVerdict": "<Ready|Almost Ready|Needs Practice|Not Ready>",
  "starBreakdown": {
    "situation": <true|false>,
    "task": <true|false>,
    "action": <true|false>,
    "result": <true|false>
  },
  "fillerWordCount": ${fillerCount},
  "fillerRate": "${fillerRate}%",
  "strengths": ["<str 1>", "<str 2>"],
  "improvements": ["<imp 1>", "<imp 2>"],
  "coachingTip": "<One specific, actionable coaching tip for this answer>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function generateOverallFeedback({ role, answers, mode }) {
  const model = getModel();

  const summaryData = answers.map((a, i) => ({
    q: i + 1,
    score: mode === "hirevue" ? a.evaluation?.overall : a.evaluation?.score,
    verdict: mode === "hirevue" ? a.evaluation?.readinessVerdict : a.evaluation?.verdict,
  }));

  const prompt = `You are giving final feedback to a ${role} candidate after their ${mode === "hirevue" ? "HireVue" : "mock"} interview.

Per-question scores: ${JSON.stringify(summaryData)}

Generate overall feedback. Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "overallVerdict": "<string>",
  "topStrengths": ["<s1>", "<s2>", "<s3>"],
  "keyImprovements": ["<i1>", "<i2>", "<i3>"],
  "readinessLevel": "<Ready to Interview|Almost There|Needs More Practice>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
