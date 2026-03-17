# CareerPilot — DSA Coding Round

A HackerRank-style coding interview feature built into CareerPilot. Candidates pick a difficulty and topic, get a real DSA problem with a Monaco editor, write their solution, run it against test cases via Glot.io, and get a deterministic score based on correctness and time taken.

---

## How it works

### Entry points

There are two ways to reach the coding round:

**Standalone** — from the Dashboard, click the **`</> Coding Round`** button. This takes you to `/coding-setup` where you configure difficulty, topic, role, and language, then generates a problem instantly.

**After behavioral interview** — complete a Standard Mock interview, and the results page shows a **"Continue to Coding Round →"** button that carries your role and score into the coding round.

---

## The Setup Screen (`/coding-setup`)

Before the problem loads, candidates configure four things:

**Target Role** — 7 presets (Software Engineer, Frontend Developer, Backend Developer, Data Scientist, ML Engineer, Full Stack Developer) plus a custom input. The role is passed to the AI evaluator for context.

**Difficulty** — three levels with descriptions:
- `Easy` — basic data structures, simple loops, O(n) solutions
- `Medium` — requires insight, 1–2 key observations
- `Hard` — complex algorithms, DP, advanced graphs

**Topic** — 12 topics to filter by: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting & Searching, HashMaps, Stacks & Queues, Recursion & Backtracking, Greedy, or "Any" for random selection. Topics shown dynamically update based on what's available at the selected difficulty level.

**Language** — Python 3, JavaScript (Node.js), C++ (GCC), Java.

Clicking "Generate Problem →" picks a random matching problem from the local question bank and navigates to the coding editor instantly — no API call, no wait.

---

## The Question Bank (`src/lib/questionBank.js`)

Problems are stored locally as a JavaScript array — zero network requests to fetch them. Current bank has **24 curated problems**:

| Difficulty | Count | Topics covered |
|---|---|---|
| Easy | 10 | Arrays, Strings, HashMaps, Stacks & Queues |
| Medium | 10 | Arrays, Dynamic Programming, Trees, Linked Lists, Recursion, Greedy |
| Hard | 4 | Dynamic Programming, Graphs, Sorting & Searching |

**Topics breakdown:**
- Arrays — 8 problems
- Dynamic Programming — 5 problems
- Strings — 3 problems
- Trees, Stacks & Queues, Sorting & Searching, Recursion & Backtracking, Linked Lists, HashMaps, Greedy, Graphs — 1 each

**Each problem contains:**
```js
{
  id:              "e-arr-001",            // unique ID
  title:           "Two Sum",
  difficulty:      "Easy",
  topic:           "Arrays",
  description:     "...",                  // full problem statement
  inputFormat:     "...",                  // how stdin is structured
  outputFormat:    "...",                  // what stdout should look like
  constraints:     ["2 <= n <= 10^4", ...],
  examples:        [{ input, output, explanation }, ...],  // 2 shown to user
  testCases:       [{ input, expectedOutput }, ...],       // 5 hidden test cases
  hints:           ["hint 1", "hint 2", "hint 3"],         // revealed one at a time
  optimalApproach: "HashMap",
  timeComplexity:  "O(n)",
  spaceComplexity: "O(n)",
  starterCode: {
    python:     "...",   // function signature + stdin boilerplate
    javascript: "...",
    cpp:        "...",
    java:       "...",
  }
}
```

### Filtering logic (`getQuestion`)

```js
getQuestion(difficulty, topic)
```

1. Filter bank by difficulty
2. Filter by topic if not "Any"
3. If no match found, fall back to all problems at that difficulty
4. Pick randomly from the filtered pool

### Adding more questions

Append to the `QUESTION_BANK` array in `src/lib/questionBank.js` following the same structure. Every problem needs all fields including `starterCode` in all 4 languages and at least 5 `testCases` with exact expected outputs.

---

## The Editor Screen (`/coding`)

Split-panel layout: problem statement on the left (40%), Monaco editor + console on the right (60%).

**Top bar** shows the problem title, difficulty badge (color-coded green/yellow/red), topic tag, a live timer, language selector dropdown, hint button, and exit.

**Hint system** — 3 hints per problem revealed one at a time. Each click of the 💡 button reveals the next hint without spoiling the full approach. The hint bar appears below the top bar and stacks hints as more are revealed.

**Monaco Editor** — VS Code's editor running in the browser, loaded from the Cloudflare CDN. Pre-loaded with starter code for the selected language. Supports syntax highlighting, autocomplete, and bracket matching. Language can be switched mid-session using the top bar dropdown — starter code updates automatically.

**Timer** — counts up from 0:00. Turns yellow after 20 minutes, red after 30 minutes. Used for time scoring.

**Console** — split into two tabs:

`Test Cases` — shows all 5 test cases as ✓/✗ badges after running. Failing tests show input, expected output, and actual output. Compile errors and runtime errors show in red.

`Custom Input` — paste any input, click Run, see raw output. Useful for debugging before running against official test cases.

---

## Code Execution (`src/lib/codeRunner.js`)

Uses **Glot.io** — a completely free public code execution API. No API key, no signup, no rate limit headers required.

```
POST https://glot.io/api/run/{language}/latest
Body: { files: [{ name: "main.py", content: "..." }] }
```

**The stdin problem:** Glot doesn't support a `stdin` field. To pass test case input to the code, `codeRunner.js` wraps the user's code before sending it — injecting input as hardcoded data:

| Language | Injection method |
|---|---|
| Python | Replaces `input()` with a fake function reading from a list; patches `sys.stdin` |
| JavaScript | Overrides `fs.readFileSync('/dev/stdin')` to return the input string |
| C++ | Prepends a `std::istringstream` that redirects `cin` |
| Java | Injects `System.setIn(new ByteArrayInputStream(...))` at the start of `main` |

**400ms delay between test cases** to avoid hitting Glot's rate limit when running 5 cases in sequence.

---

## Scoring (`src/lib/geminiDSA.js`)

Pure deterministic math — no AI involved in scoring.

```
correctness = (passed / total) × 70       // 70 points max
timeBonus   = (1 - timeTaken / timeLimit × 1.5) × 30  // 30 points max
score       = correctness + timeBonus
```

Time limits by difficulty:
- Easy → 10 minutes ideal
- Medium → 20 minutes ideal
- Hard → 30 minutes ideal

**Verdict labels:**
| Pass rate | Verdict |
|---|---|
| 5/5 | All Passed ✓ |
| 4/5 | Mostly Correct |
| 3/5 | Partially Correct |
| 2/5 | Needs Work |
| 1/5 | Wrong Answer |
| 0/5 | Incorrect |

**Time verdicts:** Excellent speed / Good timing / A bit slow / Overtime

---

## Results Screen

After submitting, the results page shows:

- Overall score out of 100 with verdict badge
- Test cases passed (X/5) with correctness points
- Time taken with time verdict and bonus points
- First failing test case — input, expected output, actual output, error message if any
- Optimal approach name, time complexity, space complexity from the question bank

Two action buttons: **Try Another** (resets to setup screen) and **Dashboard**.

---

## File structure

```
src/
├── lib/
│   ├── questionBank.js    ← 24 problems, getQuestion(), getTopicsForDifficulty()
│   ├── codeRunner.js      ← Glot.io execution, stdin injection per language
│   └── geminiDSA.js       ← deterministic scoring, no AI
├── pages/
│   ├── CodingSetup.jsx    ← /coding-setup — difficulty, topic, language, role
│   └── CodingRound.jsx    ← /coding — Monaco editor, console, run/submit
```

---

## Environment variables

No new variables needed for the coding round. Glot.io requires no API key. The only key needed is the existing `VITE_GEMINI_API_KEY` — but only for the behavioral interview evaluation, not for the coding round at all.

---

## Known limitations

- Glot.io stdin injection works for standard competitive-programming style input (space/newline separated). Problems with complex multi-line structured input may need custom starter code adjustments.
- Java class must be named `Main` — starter code enforces this.
- C++ stdin injection requires at least one `#include` in the starter code to find the injection point.
- Glot.io occasionally has cold start delays of 2–3 seconds on the first execution.
