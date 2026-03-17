// src/lib/piston.js
// Piston API — completely free, no API key, no signup
// https://emkc.org/api/v2/piston
// Supports 30+ languages, no rate limit for reasonable usage

const PISTON_BASE = "https://emkc.org/api/v2/piston";

// Fallback instances if primary fails
const PISTON_INSTANCES = [
  "https://emkc.org/api/v2/piston",
  "https://piston.pydide.com/api/v2",
];

// Language + version map for Piston
export const LANGUAGE_CONFIG = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  cpp: { language: "c++", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};

export const LANGUAGE_LABELS = {
  python: "Python 3",
  javascript: "JavaScript (Node.js)",
  cpp: "C++ (GCC)",
  java: "Java",
};

// Execute code with given stdin
async function executeCode(code, language, stdin = "") {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const response = await fetch(`${PISTON_BASE}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ name: "main", content: code }],
      stdin,
      run_timeout: 5000,   // 5 seconds max
      compile_timeout: 10000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.status}`);
  }

  const result = await response.json();

  // result.run contains { stdout, stderr, code, signal }
  // result.compile (for compiled langs) contains { stdout, stderr, code }
  const compileError = result.compile?.stderr || result.compile?.stdout || "";
  const isCompileError = result.compile && result.compile.code !== 0;

  return {
    stdout: result.run?.stdout || "",
    stderr: result.run?.stderr || "",
    compileError: isCompileError ? compileError : "",
    exitCode: result.run?.code ?? 0,
    isError: isCompileError || (result.run?.code !== 0),
    signal: result.run?.signal,
  };
}

// Run code against all test cases
export async function runTestCases(code, language, testCases) {
  const results = [];

  for (const tc of testCases) {
    try {
      const result = await executeCode(code, language, tc.input);

      const actual = result.stdout.trim();
      const expected = (tc.expectedOutput || "").trim();

      let errorMsg = null;
      if (result.compileError) errorMsg = result.compileError.slice(0, 200);
      else if (result.isError && result.stderr) errorMsg = result.stderr.slice(0, 200);

      results.push({
        input: tc.input,
        expected,
        actual: result.isError ? (errorMsg || "Runtime Error") : actual,
        passed: !result.isError && actual === expected,
        status: result.isError
          ? (result.compileError ? "Compile Error" : "Runtime Error")
          : (actual === expected ? "Accepted" : "Wrong Answer"),
        error: errorMsg,
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

// Run code with custom input (for the Run button)
export async function runCustomInput(code, language, customInput) {
  const result = await executeCode(code, language, customInput || "");

  const output = result.compileError
    ? `Compile Error:\n${result.compileError}`
    : result.stderr && result.isError
      ? `Runtime Error:\n${result.stderr}`
      : result.stdout || "(no output)";

  return {
    output,
    isError: result.isError,
  };
}
