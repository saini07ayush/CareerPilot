// src/lib/codeRunner.js
// Uses Gemini to simulate code execution — zero cost, no external API, no auth
// Gemini runs the code mentally and returns the output accurately for most cases

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const getModel = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const LANGUAGE_LABELS = {
  python: "Python 3",
  javascript: "JavaScript (Node.js)",
  cpp: "C++ (GCC)",
  java: "Java",
};

// Execute code against a single input via Gemini simulation
async function executeCode(code, language, stdin) {
  const model = getModel();

  const prompt = `You are a ${language} code interpreter. Execute this code exactly as a real interpreter would.

Code:
\`\`\`${language}
${code}
\`\`\`

Standard Input (stdin):
${stdin || "(empty)"}

Rules:
- Execute the code mentally step by step
- Return ONLY the exact stdout output the program would produce
- Include newlines exactly as the program would output them
- If there's a runtime error, return exactly: RUNTIME_ERROR: <error message>
- If there's a compilation error, return exactly: COMPILE_ERROR: <error message>
- No explanation, no markdown, just the raw output

Output:`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  const isRuntimeError = raw.startsWith("RUNTIME_ERROR:");
  const isCompileError = raw.startsWith("COMPILE_ERROR:");
  const isError = isRuntimeError || isCompileError;

  return {
    stdout: isError ? "" : raw,
    stderr: isError ? raw : "",
    isError,
    errorType: isCompileError ? "Compile Error" : isRuntimeError ? "Runtime Error" : null,
  };
}

// Run code against all test cases
export async function runTestCases(code, language, testCases) {
  const results = [];

  // Run test cases with small delay to avoid rate limiting
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      if (i > 0) await new Promise(r => setTimeout(r, 300)); // small delay between calls

      const result = await executeCode(code, language, tc.input);

      const actual = result.stdout.trim();
      const expected = (tc.expectedOutput || "").trim();
      const passed = !result.isError && actual === expected;

      results.push({
        input: tc.input,
        expected,
        actual: result.isError ? result.stderr : actual,
        passed,
        status: result.isError
          ? result.errorType
          : passed ? "Accepted" : "Wrong Answer",
        error: result.isError ? result.stderr.replace(/^(RUNTIME|COMPILE)_ERROR:\s*/, "") : null,
      });
    } catch (err) {
      results.push({
        input: tc.input,
        expected: tc.expectedOutput || "",
        actual: "Error",
        passed: false,
        status: "Error",
        error: err.message,
      });
    }
  }

  return results;
}

// Run code with custom input
export async function runCustomInput(code, language, customInput) {
  const result = await executeCode(code, language, customInput || "");
  return {
    output: result.isError
      ? result.stderr.replace(/^(RUNTIME|COMPILE)_ERROR:\s*/, "")
      : result.stdout || "(no output)",
    isError: result.isError,
  };
}
