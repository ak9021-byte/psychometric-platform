"use client";
import { useEffect, useState } from "react";
import { getQuestions, submitTest } from "@/lib/api";
import { useRouter } from "next/navigation";

type Question = {
  id: number; text: string; category: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  logical_mathematical: "#3b82f6", interpersonal: "#8b5cf6",
  bodily_kinesthetic: "#10b981",   verbal_linguistic: "#f59e0b",
  musical: "#ec4899",              naturalist: "#06b6d4",
  spatial_visual: "#f97316",       intrapersonal: "#6366f1",
  riasec_realistic: "#84cc16",     riasec_investigative: "#14b8a6",
  riasec_artistic: "#a855f7",      riasec_social: "#ef4444",
  riasec_enterprising: "#f59e0b",  riasec_conventional: "#64748b",
};

const CATEGORY_LABELS: Record<string, string> = {
  logical_mathematical: "Logical Mathematical",
  interpersonal:        "Interpersonal",
  bodily_kinesthetic:   "Bodily Kinesthetic",
  verbal_linguistic:    "Verbal Linguistic",
  musical:              "Musical",
  naturalist:           "Naturalist",
  spatial_visual:       "Spatial Visual",
  intrapersonal:        "Intrapersonal",
  riasec_realistic:     "Realistic",
  riasec_investigative: "Investigative",
  riasec_artistic:      "Artistic",
  riasec_social:        "Social",
  riasec_enterprising:  "Enterprising",
  riasec_conventional:  "Conventional",
};

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers,   setAnswers]   = useState<Record<number, string>>({});
  const [current,   setCurrent]   = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    getQuestions()
      .then((r) => setQuestions(r.data))
      .catch(() => setError("Failed to load questions. Please login again."))
      .finally(() => setFetching(false));
  }, []);

  // Prevent going back after submit
  useEffect(() => {
    if (submitted) {
      window.history.pushState(null, "", window.location.href);
      const handlePop = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [submitted]);

  const handleAnswer = (qId: number, opt: string) =>
    setAnswers((p) => ({ ...p, [qId]: opt }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formatted = Object.entries(answers).map(([qid, opt]) => ({
        question_id: Number(qid),
        selected_option: opt,
      }));
      await submitTest(formatted);
      setSubmitted(true);
      window.location.href = "/report";
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Submission failed. Please try again.";
      if (msg.toLowerCase().includes("already")) {
        window.location.href = "/report";
      } else {
        setError(msg);
        setLoading(false);
      }
    }
  };

  // ── Fetching screen ───────────────────────────────────────────────────────
  if (fetching) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", background:"#f1f5f9" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, border:"4px solid #667eea", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#666", fontSize:16 }}>Loading questions...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── Submitting screen ─────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
      <div style={{ textAlign:"center", background:"white", padding:"56px 72px", borderRadius:24, boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ width:72, height:72, border:"5px solid #667eea", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 24px" }}/>
        <h2 style={{ color:"#1e293b", fontWeight:800, fontSize:24, margin:"0 0 10px" }}>
          Submitting your test...
        </h2>
        <p style={{ color:"#94a3b8", fontSize:15, margin:"0 0 24px" }}>
          Please wait, we are calculating your results
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
          {[0,1,2].map((i) => (
            <div key={i} style={{
              width:10, height:10, borderRadius:"50%", background:"#667eea",
              animation:`bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate`
            }}/>
          ))}
        </div>
        <style>{`
          @keyframes spin   { to { transform: rotate(360deg) } }
          @keyframes bounce { to { transform: translateY(-10px); opacity: 0.3 } }
        `}</style>
      </div>
    </div>
  );

  if (!questions.length) return null;

  const q          = questions[current];
  const progress   = Math.round(((current + 1) / questions.length) * 100);
  const answered   = Object.keys(answers).length;
  const catColor   = CATEGORY_COLORS[q.category] || "#667eea";
  const catLabel   = CATEGORY_LABELS[q.category] || q.category;
  const isLast     = current === questions.length - 1;
  const allDone    = answered >= questions.length;
  const unanswered = questions.length - answered;

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* ── Navbar ── */}
      <div style={{
        background:"white", borderBottom:"1px solid #e2e8f0",
        padding:"14px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", position:"sticky", top:0, zIndex:10,
        boxShadow:"0 2px 8px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>🧠</span>
          <span style={{ fontWeight:700, fontSize:18, color:"#1a1a2e" }}>Psychometric Assessment</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ color:"#888", fontSize:14, fontWeight:500 }}>
            {answered}/{questions.length} answered
          </span>
          <span style={{
            background: catColor + "20", color: catColor,
            padding:"4px 14px", borderRadius:20, fontSize:13, fontWeight:600,
          }}>
            {catLabel}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height:5, background:"#e2e8f0" }}>
        <div style={{
          height:"100%", width:`${progress}%`,
          background:"linear-gradient(90deg,#667eea,#764ba2)",
          transition:"width 0.4s ease"
        }}/>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 20px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background:"#fff0f0", border:"1px solid #fca5a5", color:"#dc2626",
            padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:14,
            display:"flex", alignItems:"center", gap:8
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Question card ── */}
        <div style={{
          background:"white", borderRadius:20, padding:"36px",
          boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:20
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <span style={{ background:catColor+"15", color:catColor, padding:"6px 14px", borderRadius:20, fontSize:13, fontWeight:700 }}>
              Question {current + 1} of {questions.length}
            </span>
            <span style={{ color:"#cbd5e1", fontSize:13 }}>{progress}% complete</span>
          </div>

          <h2 style={{ fontSize:20, fontWeight:700, color:"#1e293b", lineHeight:1.6, marginBottom:28 }}>
            {q.text}
          </h2>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {(["a","b","c","d"] as const).map((opt, idx) => {
              const label    = q[`option_${opt}` as keyof Question] as string;
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  style={{
                    display:"flex", alignItems:"center", gap:16,
                    padding:"16px 20px", borderRadius:12, cursor:"pointer", textAlign:"left",
                    border: selected ? `2px solid ${catColor}` : "2px solid #e2e8f0",
                    background: selected ? catColor+"12" : "white",
                    transition:"all 0.15s", fontFamily:"inherit", width:"100%"
                  }}
                >
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: selected ? catColor : "#f1f5f9",
                    color: selected ? "white" : "#64748b",
                    fontWeight:700, fontSize:15, transition:"all 0.15s"
                  }}>
                    {["A","B","C","D"][idx]}
                  </div>
                  <span style={{ fontSize:15, color: selected ? "#1e293b" : "#475569", fontWeight: selected ? 600 : 400 }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button
            onClick={() => setCurrent((p) => Math.max(p - 1, 0))}
            disabled={current === 0}
            style={{
              padding:"12px 24px", borderRadius:12, border:"2px solid #e2e8f0",
              background:"white", color:"#64748b", fontWeight:600, fontSize:15,
              cursor: current === 0 ? "not-allowed" : "pointer",
              opacity: current === 0 ? 0.4 : 1, fontFamily:"inherit"
            }}
          >← Previous</button>

          {!isLast ? (
            <button
              onClick={() => setCurrent((p) => p + 1)}
              style={{
                padding:"12px 28px", borderRadius:12,
                background:"linear-gradient(135deg,#667eea,#764ba2)",
                color:"white", border:"none", fontWeight:700, fontSize:15,
                cursor:"pointer", fontFamily:"inherit"
              }}
            >Next →</button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allDone}
              title={!allDone ? `${unanswered} question(s) still unanswered` : ""}
              style={{
                padding:"12px 28px", borderRadius:12,
                background: allDone
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "#94a3b8",
                color:"white", border:"none", fontWeight:700, fontSize:15,
                cursor: allDone ? "pointer" : "not-allowed", fontFamily:"inherit",
                transition:"all 0.2s"
              }}
            >
              {allDone ? "Submit Test ✓" : `${unanswered} question${unanswered > 1 ? "s" : ""} remaining`}
            </button>
          )}
        </div>

        {/* ── Warning unanswered ── */}
        {isLast && !allDone && (
          <div style={{
            marginTop:12, padding:"10px 16px", background:"#fffbeb",
            border:"1px solid #fcd34d", borderRadius:10, color:"#92400e",
            fontSize:13, textAlign:"center"
          }}>
            ⚠️ Please answer all {unanswered} remaining question{unanswered > 1 ? "s" : ""} before submitting.
            <button
              onClick={() => {
                const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
                if (firstUnanswered !== -1) setCurrent(firstUnanswered);
              }}
              style={{
                marginLeft:10, color:"#667eea", fontWeight:700, background:"none",
                border:"none", cursor:"pointer", fontSize:13, fontFamily:"inherit"
              }}
            >Go to first unanswered →</button>
          </div>
        )}

        {/* ── Question grid dots ── */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:24, justifyContent:"center" }}>
          {questions.map((qq, i) => (
            <div
              key={qq.id}
              onClick={() => setCurrent(i)}
              title={`Question ${i + 1}${answers[qq.id] ? " ✓" : ""}`}
              style={{
                width:28, height:28, borderRadius:8, cursor:"pointer",
                background: answers[qq.id] ? "#667eea" : i === current ? "#e2e8f0" : "#f1f5f9",
                border: i === current ? "2px solid #667eea" : "2px solid transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:600,
                color: answers[qq.id] ? "white" : "#94a3b8",
                transition:"all 0.15s"
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:4, background:"#667eea" }}/>
            <span style={{ fontSize:12, color:"#64748b" }}>Answered</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:4, background:"#f1f5f9", border:"1px solid #e2e8f0" }}/>
            <span style={{ fontSize:12, color:"#64748b" }}>Not answered</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:4, background:"#e2e8f0", border:"2px solid #667eea" }}/>
            <span style={{ fontSize:12, color:"#64748b" }}>Current</span>
          </div>
        </div>

      </div>
    </div>
  );
}