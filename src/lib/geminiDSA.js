// src/lib/geminiDSA.js
// Only evaluation uses Gemini — problem generation uses local question bank
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const getModel = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function evaluateCodeSolution({
  role, problem, code, language,
  testResults, // array of { input, expected, actual, passed }
  timeTaken,   // seconds
}) {
  const model = getModel();

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;

  const prompt = `You are a senior engineer doing a technical interview evaluation for a ${role} candidate.

Problem: "${problem.title}" (${problem.difficulty})
Optimal approach: ${problem.optimalApproach}
Optimal time complexity: ${problem.timeComplexity}

Candidate's solution (${language}):
\`\`\`${language}
${code}
\`\`\`

Test results: ${passedCount}/${totalCount} test cases passed
Time taken: ${timeTaken} seconds

Evaluate this solution comprehensively. Return ONLY valid JSON, no markdown:
{
  "overallScore": <0-100>,
  "verdict": "<Optimal|Good|Acceptable|Needs Work|Incorrect>",
  "correctness": <0-25>,
  "codeQuality": <0-25>,
  "timeComplexity": <0-25>,
  "problemSolving": <0-25>,
  "detectedApproach": "<what approach the candidate actually used>",
  "detectedTimeComplexity": "<e.g. O(n²) — based on their code>",
  "detectedSpaceComplexity": "<e.g. O(n)>",
  "isOptimal": <true|false>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "optimalSolution": "<clean optimal solution in ${language} with comments>",
  "explanation": "<2-3 sentence explanation of the optimal approach>",
  "interviewerNote": "<what a real interviewer would say about this submission>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
