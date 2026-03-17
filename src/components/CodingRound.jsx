import { useState, useEffect, useRef } from "react";

const mono = "'Share Tech Mono', monospace";
const orbitron = "'Orbitron', monospace";
const rajdhani = "'Rajdhani', sans-serif";

const STARTER_CODE = {
  python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Your solution here\n        seen = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n        return []`,
  javascript: `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) return [map.get(complement), i];\n        map.set(nums[i], i);\n    }\n};`,
  cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) return {seen[complement], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) return new int[]{seen.get(complement), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
};

const HINTS = [
  "Think about what data structure allows O(1) lookups. Consider using a HashMap.",
  "For each number, calculate its complement (target - num). Check if you've seen it before.",
  "Store each number and its index as you iterate. One pass is enough.",
];

const MOCK_RESULTS = [
  { pass: true,  label: "Test 1",        input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", got: "[0, 1]",         time: "0.12s", hidden: false },
  { pass: true,  label: "Test 2",        input: "nums = [3,2,4], target = 6",     expected: "[1, 2]", got: "[1, 2]",         time: "0.08s", hidden: false },
  { pass: false, label: "Test 3 Hidden", input: "[hidden]",                        expected: "[hidden]", got: "Wrong Answer", time: null,    hidden: true  },
  { pass: false, label: "Test 4 Hidden", input: "[hidden]",                        expected: "[hidden]", got: "TLE",          time: null,    hidden: true  },
  { pass: false, label: "Test 5 Hidden", input: "[hidden]",                        expected: "[hidden]", got: "Runtime Error", time: null,   hidden: true  },
];

export default function CodingRound({ config, onBack }) {
  const { role } = config || {};
  const [lang, setLang]               = useState("python");
  const [code, setCode]               = useState(STARTER_CODE["python"]);
  const [activeTab, setActiveTab]     = useState("testcases");
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning]         = useState(false);
  const [hintsShown, setHintsShown]   = useState(0);
  const [customInput, setCustomInput] = useState("nums = [2, 7, 11, 15]\ntarget = 9");
  const [customOutput, setCustomOutput] = useState("");
  const [elapsed, setElapsed]         = useState(0);
  const [submitted, setSubmitted]     = useState(false);
  const startRef                      = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const handleLangChange = (l) => { setLang(l); setCode(STARTER_CODE[l]); };
  const lines = code.split("\n").length;
  const passed = testResults.filter(r => r.pass).length;

  const handleRunTests = () => {
    setRunning(true); setTestResults([]); setActiveTab("testcases");
    let i = 0;
    const iv = setInterval(() => {
      if (i >= MOCK_RESULTS.length) { clearInterval(iv); setRunning(false); return; }
      setTestResults(prev => [...prev, MOCK_RESULTS[i]]); i++;
    }, 350);
  };

  const handleRunCustom = () => {
    setRunning(true); setCustomOutput(""); setActiveTab("output");
    setTimeout(() => { setCustomOutput("> Output:\n[0, 1]\n\n> Execution time: 0.09s\n> Memory: 14.2 MB"); setRunning(false); }, 800);
  };

  const handleSubmit = () => { setRunning(true); setTimeout(() => { setRunning(false); setSubmitted(true); }, 1200); };

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"#0e0e0e", color:"#c8c0a8", fontFamily:rajdhani, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ border:"1px solid #1c1c1c", background:"#0a0a0a", padding:40, maxWidth:480, width:"100%", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent, #39ff8a, transparent)" }} />
        <div style={{ fontFamily:orbitron, fontSize:11, color:"#39ff8a", letterSpacing:"0.2em", marginBottom:16 }}>✓ SOLUTION SUBMITTED</div>
        <div style={{ fontFamily:orbitron, fontSize:48, fontWeight:900, color:"#e8a020", textShadow:"0 0 30px rgba(232,160,32,.3)", marginBottom:8 }}>{passed}/{MOCK_RESULTS.length}</div>
        <div style={{ fontFamily:mono, fontSize:11, color:"#4a4440", letterSpacing:"0.1em", marginBottom:32 }}>TEST CASES PASSED</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"#1c1c1c", marginBottom:32 }}>
          {[["O(n)","Time"],["O(n)","Space"],["0.12s","Runtime"]].map(([v,l]) => (
            <div key={l} style={{ background:"#0a0a0a", padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontFamily:orbitron, fontSize:16, fontWeight:700, color:"#e8a020" }}>{v}</div>
              <div style={{ fontFamily:mono, fontSize:9, color:"#4a4440", marginTop:4, letterSpacing:"0.1em" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:mono, fontSize:11, color:"#4a4440", marginBottom:24, lineHeight:1.8, padding:"12px 16px", background:"#111", borderLeft:"2px solid #e8a020", textAlign:"left" }}>
          ⚡ Gemini evaluation coming soon — full code quality analysis and improvement suggestions will be available in the next release.
        </div>
        <button onClick={onBack} style={{ width:"100%", padding:14, background:"#e8a020", color:"#080808", border:"none", fontFamily:orbitron, fontWeight:700, fontSize:11, letterSpacing:"0.15em", cursor:"pointer" }}>← BACK TO DASHBOARD</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#c8c0a8", fontFamily:rajdhani, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <nav style={{ height:48, background:"#0e0e0e", borderBottom:"1px solid #1c1c1c", display:"flex", alignItems:"center", padding:"0 16px", gap:10, flexShrink:0 }}>
        <div style={{ fontFamily:orbitron, fontSize:13, fontWeight:900, color:"#e8a020", letterSpacing:"0.1em" }}>CAREER<span style={{color:"#c8c0a8"}}>PILOT</span></div>
        {[["CODING ROUND","#a78bfa"],["MEDIUM","#e8a020"],[role?.toUpperCase()||"SWE","#39ff8a"]].map(([l,c]) => (
          <div key={l} style={{ fontFamily:mono, fontSize:9, padding:"3px 8px", border:`1px solid ${c}40`, color:c, background:`${c}10`, letterSpacing:"0.1em" }}>{l}</div>
        ))}
        <div style={{ marginLeft:"auto", fontFamily:mono, fontSize:13, color:elapsed>45*60?"#ff5555":"#e8a020", letterSpacing:"0.15em" }}>{formatTime(elapsed)}</div>
        {hintsShown < HINTS.length && (
          <button onClick={() => setHintsShown(h=>h+1)} style={{ background:"rgba(250,204,21,0.06)", border:"1px solid rgba(250,204,21,0.3)", color:"#facc15", fontFamily:mono, fontSize:10, padding:"5px 12px", cursor:"pointer", letterSpacing:"0.1em" }}>💡 HINT {hintsShown+1}</button>
        )}
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid #1c1c1c", color:"#4a4440", fontFamily:mono, fontSize:10, padding:"5px 12px", cursor:"pointer" }}>EXIT</button>
      </nav>

      <div style={{ height:2, background:"#1c1c1c", flexShrink:0 }}>
        <div style={{ height:2, background:"#e8a020", width:`${Math.min((elapsed/(60*60))*100,95)}%`, transition:"width 1s", boxShadow:"0 0 8px rgba(232,160,32,.5)" }} />
      </div>

      {hintsShown > 0 && (
        <div style={{ background:"rgba(232,160,32,.04)", borderBottom:"1px solid rgba(232,160,32,.12)", padding:"8px 16px", fontFamily:mono, fontSize:10, color:"#e8a020", flexShrink:0 }}>
          💡 {HINTS[hintsShown-1]}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr", flex:1, overflow:"hidden" }}>
        <div style={{ borderRight:"1px solid #1c1c1c", overflowY:"auto" }}>
          <div style={{ padding:"10px 16px", borderBottom:"1px solid #1c1c1c", display:"flex", alignItems:"center", gap:8, background:"#0e0e0e", position:"sticky", top:0 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#e8a020", boxShadow:"0 0 8px #e8a020" }} />
            <span style={{ fontFamily:mono, fontSize:10, color:"#e8a020", letterSpacing:"0.2em" }}>PROBLEM STATEMENT</span>
            <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:9, color:"#2a2a2a" }}>#042 · ARRAYS</span>
          </div>
          <div style={{ padding:16, fontSize:14, lineHeight:1.7, color:"#a8a090" }}>
            <div style={{ fontFamily:orbitron, fontSize:16, fontWeight:700, color:"#e8e0d0", marginBottom:12 }}>Two Sum</div>
            <p>Given an array <code style={{fontFamily:mono,color:"#e8a020",background:"rgba(232,160,32,.08)",padding:"1px 5px"}}>nums</code> and integer <code style={{fontFamily:mono,color:"#e8a020",background:"rgba(232,160,32,.08)",padding:"1px 5px"}}>target</code>, return indices of two numbers that add up to target.</p>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.2em", color:"#4a4440", margin:"14px 0 6px" }}>CONSTRAINTS</div>
            {["2 ≤ nums.length ≤ 10⁴","−10⁹ ≤ nums[i] ≤ 10⁹","Only one valid answer exists"].map(c=>(
              <div key={c} style={{ fontFamily:mono, fontSize:11, color:"#4a4440", marginBottom:4 }}>• {c}</div>
            ))}
            {[["Example 1","nums = [2,7,11,15], target = 9","[0, 1]","nums[0] + nums[1] = 9"],
              ["Example 2","nums = [3,2,4], target = 6","[1, 2]","nums[1] + nums[2] = 6"]].map(([h,inp,out,exp])=>(
              <div key={h}>
                <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.2em", color:"#4a4440", margin:"14px 0 6px" }}>{h.toUpperCase()}</div>
                <div style={{ background:"#141414", border:"1px solid #1c1c1c", padding:12 }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:"#4a4440", marginBottom:4 }}>INPUT</div>
                  <pre style={{ fontFamily:mono, fontSize:11, color:"#e8a020", marginBottom:8 }}>{inp}</pre>
                  <div style={{ fontFamily:mono, fontSize:9, color:"#4a4440", marginBottom:4 }}>OUTPUT</div>
                  <pre style={{ fontFamily:mono, fontSize:11, color:"#39ff8a", marginBottom:6 }}>{out}</pre>
                  <div style={{ fontFamily:mono, fontSize:10, color:"#4a4440" }}>{exp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"8px 12px", borderBottom:"1px solid #1c1c1c", display:"flex", alignItems:"center", gap:8, background:"#0e0e0e", flexShrink:0 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4a9eff", boxShadow:"0 0 8px #4a9eff" }} />
            <span style={{ fontFamily:mono, fontSize:10, color:"#4a9eff", letterSpacing:"0.2em" }}>CODE EDITOR</span>
            <select value={lang} onChange={e=>handleLangChange(e.target.value)} style={{ marginLeft:8, fontFamily:mono, fontSize:10, background:"#141414", border:"1px solid #1c1c1c", color:"#c8c0a8", padding:"4px 8px", outline:"none", cursor:"pointer" }}>
              {[["python","Python 3"],["javascript","JavaScript"],["cpp","C++ (GCC)"],["java","Java"]].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ flex:1, background:"#1e1e1e", display:"flex", overflow:"auto", minHeight:0 }}>
            <div style={{ padding:"16px 8px", background:"#1e1e1e", textAlign:"right", userSelect:"none", flexShrink:0 }}>
              {Array.from({length:lines},(_,i)=>(
                <div key={i} style={{ fontFamily:mono, fontSize:13, lineHeight:1.6, color:"#4a4a4a", minWidth:28 }}>{i+1}</div>
              ))}
            </div>
            <textarea value={code} onChange={e=>setCode(e.target.value)} style={{ flex:1, padding:16, background:"#1e1e1e", border:"none", outline:"none", color:"#d4d4d4", fontFamily:mono, fontSize:13, lineHeight:1.6, resize:"none", whiteSpace:"pre", overflowWrap:"normal", overflowX:"auto" }} spellCheck={false} />
          </div>

          <div style={{ flexShrink:0, borderTop:"1px solid #1c1c1c", height:200, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", padding:"0 12px", borderBottom:"1px solid #1c1c1c", background:"#0e0e0e" }}>
              {[["testcases",`TEST CASES${testResults.length>0?` (${passed}/${testResults.length})`:""}`],["custom","CUSTOM"],["output","OUTPUT"]].map(([t,l])=>(
                <button key={t} onClick={()=>setActiveTab(t)} style={{ fontFamily:mono, fontSize:10, letterSpacing:"0.1em", padding:"8px 12px", borderBottom:`2px solid ${activeTab===t?"#e8a020":"transparent"}`, marginBottom:-1, color:activeTab===t?"#e8a020":"#4a4440", background:"none", border:"none", borderBottom:`2px solid ${activeTab===t?"#e8a020":"transparent"}`, cursor:"pointer" }}>{l}</button>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                {running && <span style={{ fontFamily:mono, fontSize:9, color:"#4a9eff" }}>EXECUTING...</span>}
                <button onClick={handleRunTests} disabled={running} style={{ fontFamily:mono, fontSize:10, padding:"5px 12px", cursor:"pointer", border:"1px solid rgba(74,158,255,.4)", color:"#4a9eff", background:"rgba(74,158,255,.06)", letterSpacing:"0.1em", opacity:running?0.5:1 }}>▶ RUN</button>
                <button onClick={handleSubmit} disabled={running} style={{ fontFamily:orbitron, fontSize:10, fontWeight:700, padding:"5px 14px", cursor:"pointer", border:"none", background:"#e8a020", color:"#080808", letterSpacing:"0.1em", opacity:running?0.5:1 }}>SUBMIT →</button>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:12 }}>
              {activeTab==="testcases" && (testResults.length===0
                ? <div style={{fontFamily:mono,fontSize:11,color:"#2a2a2a"}}>Click RUN to execute test cases.</div>
                : testResults.map((r,i)=>(
                  <div key={i} style={{ padding:"8px 12px", marginBottom:6, border:`1px solid ${r.pass?"rgba(57,255,138,.2)":"rgba(255,85,85,.2)"}`, background:r.pass?"rgba(57,255,138,.04)":"rgba(255,85,85,.04)", fontFamily:mono, fontSize:11 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{color:r.pass?"#39ff8a":"#ff5555"}}>{r.pass?"✓":"✗"}</span>
                      <span style={{color:r.pass?"#39ff8a":"#ff5555"}}>{r.label}</span>
                      {r.time && <span style={{color:"#4a4440",fontSize:9}}>{r.time}</span>}
                      <span style={{marginLeft:"auto",fontSize:9,color:r.pass?"#39ff8a":"#ff5555"}}>{r.pass?"PASSED":r.got}</span>
                    </div>
                  </div>
                ))
              )}
              {activeTab==="custom" && (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <textarea value={customInput} onChange={e=>setCustomInput(e.target.value)} rows={3} style={{background:"#1e1e1e",border:"1px solid #1c1c1c",color:"#d4d4d4",fontFamily:mono,fontSize:11,padding:8,outline:"none",resize:"none"}} />
                  <button onClick={handleRunCustom} style={{alignSelf:"flex-start",fontFamily:mono,fontSize:10,padding:"5px 12px",cursor:"pointer",border:"1px solid rgba(74,158,255,.4)",color:"#4a9eff",background:"rgba(74,158,255,.06)"}}>▶ RUN</button>
                </div>
              )}
              {activeTab==="output" && (
                <pre style={{fontFamily:mono,fontSize:11,color:customOutput?"#39ff8a":"#2a2a2a",lineHeight:1.6}}>{customOutput||"// Output will appear here"}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height:28, background:"#0e0e0e", borderTop:"1px solid #1c1c1c", display:"flex", alignItems:"center", padding:"0 16px", gap:20, flexShrink:0 }}>
        {[{c:"#39ff8a",l:"JUDGE0 READY"},{c:"#e8a020",l:"GEMINI EVALUATOR"}].map(({c,l})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`,animation:"pulse 2s infinite"}} />
            <span style={{fontFamily:mono,fontSize:9,color:"#2a2a2a",letterSpacing:"0.1em"}}>{l}</span>
          </div>
        ))}
        <div style={{flex:1}} />
        <span style={{fontFamily:mono,fontSize:9,color:"#1c1c1c"}}>HACKANOVA 3.0 · UNPAIDINTERNS.EXE</span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} textarea{tab-size:2}`}</style>
    </div>
  );
}
