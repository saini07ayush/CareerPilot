// src/lib/judge0.js
// Uses Judge0 CE public API — free, no API key needed for basic usage
// Docs: https://ce.judge0.com

const JUDGE0_BASE = "https://judge0-ce.p.rapidapi.com";

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  python: 71,      // Python 3.8
  javascript: 63,  // Node.js 12
  cpp: 54,         // C++ (GCC 9.2)
  java: 62,        // Java (OpenJDK 13)
};

export const LANGUAGE_LABELS = {
  python: "Python 3",
  javascript: "JavaScript (Node.js)",
  cpp: "C++ (GCC)",
  java: "Java",
};

// Wrap user code to handle stdin properly per language
function wrapCode(code, language, inputData) {
  return code; // Judge0 handles stdin via the stdin field
}

// Submit a single test case to Judge0
async function submitCode(code, languageId, stdin) {
  const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;

  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  };

  // If RapidAPI key provided, use it. Otherwise try the free CE endpoint
  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
  }

  const body = JSON.stringify({
    source_code: btoa(unescape(encodeURIComponent(code))),
    language_id: languageId,
    stdin: btoa(unescape(encodeURIComponent(stdin || ""))),
    expected_output: null,
    cpu_time_limit: 5,
    memory_limit: 128000,
  });

  // Submit
  const submitRes = await fetch(`${JUDGE0_BASE}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers,
    body,
  });

  if (!submitRes.ok) throw new Error(`Judge0 submit failed: ${submitRes.status}`);
  const { token } = await submitRes.json();

  // Poll for result
  let attempts = 0;
  while (attempts < 10) {
    await new Promise(r => setTimeout(r, 1000));
    const resultRes = await fetch(
      `${JUDGE0_BASE}/submissions/${token}?base64_encoded=true`,
      { headers }
    );
    const result = await resultRes.json();

    // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error
    if (result.status?.id >= 3) {
      return {
        stdout: result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : "",
        stderr: result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : "",
        compile_output: result.compile_output ? decodeURIComponent(escape(atob(result.compile_output))) : "",
        status: result.status,
        time: result.time,
        memory: result.memory,
      };
    }
    attempts++;
  }
  throw new Error("Execution timed out");
}

// Run code against all test cases
export async function runTestCases(code, language, testCases) {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const results = [];

  for (const tc of testCases) {
    try {
      const result = await submitCode(code, languageId, tc.input);

      const actual = result.stdout.trim();
      const expected = tc.expectedOutput.trim();
      const passed = actual === expected;

      results.push({
        input: tc.input,
        expected,
        actual: result.status.id === 3 ? actual : result.stderr || result.compile_output || "Runtime Error",
        passed: passed && result.status.id === 3,
        status: result.status.description,
        time: result.time,
        error: result.status.id > 3 ? (result.stderr || result.compile_output || result.status.description) : null,
      });
    } catch (err) {
      results.push({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: "Error",
        passed: false,
        status: "Error",
        error: err.message,
      });
    }
  }

  return results;
}

// Run code with custom input (for the "Run" button)
export async function runCustomInput(code, language, customInput) {
  const languageId = LANGUAGE_IDS[language];
  const result = await submitCode(code, languageId, customInput);
  return {
    output: result.stdout || result.stderr || result.compile_output || "No output",
    status: result.status.description,
    time: result.time,
    isError: result.status.id > 3,
  };
}
