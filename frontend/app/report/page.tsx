"use client";
import { useEffect, useState } from "react";
import { getMyResult, downloadPDF } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

type float = number;

// ── Top Career Entry (new format from API) ───────────────────────────────────
type TopCareerEntry = {
  career: string;
  confidence: float; // 0–100
};

type Result = {
  user: {
    name: string; email: string;
    school: string; student_class: string;
    father_name: string; mother_name: string;
  };
  intelligence: {
    logical_mathematical: float; interpersonal: float;
    bodily_kinesthetic: float;   verbal_linguistic: float;
    musical: float;              naturalist: float;
    spatial_visual: float;       intrapersonal: float;
  };
  riasec: {
    realistic: float; investigative: float; artistic: float;
    social: float;    enterprising: float;  conventional: float;
  };
  // Support both old (single string) and new (array) formats
  top_career:  string;
  top_careers?: TopCareerEntry[];
  completed_at: string;
};

// ── Career icons / emoji map ─────────────────────────────────────────────────
const CAREER_ICONS: Record<string, string> = {
  default: "💼",
  engineer: "⚙️", doctor: "🩺", teacher: "📚", lawyer: "⚖️",
  scientist: "🔬", artist: "🎨", architect: "🏛️", nurse: "💊",
  psychologist: "🧠", accountant: "📊", designer: "✏️",
  writer: "✍️", musician: "🎵", researcher: "🔭", manager: "📋",
  programmer: "💻", developer: "💻", software: "💻",
  data: "📈", analyst: "📉", business: "📦", entrepreneur: "🚀",
  social: "🤝", counselor: "💬", therapist: "🫶",
  biologist: "🌿", chemist: "⚗️", physicist: "⚛️",
};

function getCareerIcon(careerName: string): string {
  const lower = careerName.toLowerCase();
  for (const [key, icon] of Object.entries(CAREER_ICONS)) {
    if (key !== "default" && lower.includes(key)) return icon;
  }
  return CAREER_ICONS.default;
}

// Gradient pairs for rank 1–5
const CAREER_GRADIENTS = [
  { from: "#667eea", to: "#764ba2" }, // 1st — purple
  { from: "#11998e", to: "#38ef7d" }, // 2nd — teal
  { from: "#f7971e", to: "#ffd200" }, // 3rd — amber
  { from: "#ef4444", to: "#f97316" }, // 4th — red-orange
  { from: "#06b6d4", to: "#3b82f6" }, // 5th — cyan-blue
];

const RANK_LABELS = ["🥇 Best Fit", "🥈 Great Fit", "🥉 Strong Fit", "4th", "5th"];

// ── Intelligence / RIASEC helpers ────────────────────────────────────────────
const INTEL_COLORS: Record<string, string> = {
  Logical: "#3b82f6", Interpersonal: "#8b5cf6", Bodily: "#10b981",
  Linguistic: "#f59e0b", Musical: "#ec4899", Naturalist: "#06b6d4",
  Spatial: "#f97316", Intrapersonal: "#6366f1",
};
const INTEL_ICONS: Record<string, string> = {
  Logical: "🧮", Interpersonal: "🤝", Bodily: "🏃",
  Linguistic: "📝", Musical: "🎵", Naturalist: "🌿",
  Spatial: "👁️", Intrapersonal: "🧘",
};
const RIASEC_COLORS = ["#667eea","#764ba2","#10b981","#f59e0b","#ef4444","#06b6d4"];
const RIASEC_INFO: Record<string, { icon: string; desc: string }> = {
  Realistic:     { icon:"🔧", desc:"The Doers — practical, hands-on" },
  Investigative: { icon:"🔬", desc:"The Thinkers — analytical, curious" },
  Artistic:      { icon:"🎨", desc:"The Creators — imaginative, expressive" },
  Social:        { icon:"🤝", desc:"The Helpers — caring, cooperative" },
  Enterprising:  { icon:"💼", desc:"The Persuaders — ambitious, leaders" },
  Conventional:  { icon:"📋", desc:"The Organizers — detail-oriented" },
};

function getStatus(score: float) {
  if (score >= 75) return { label:"Excellent",  bg:"#dcfce7", color:"#16a34a" };
  if (score >= 60) return { label:"Very Good",  bg:"#dbeafe", color:"#2563eb" };
  if (score >= 45) return { label:"Good",       bg:"#fef9c3", color:"#ca8a04" };
  return               { label:"Needs Work", bg:"#fee2e2", color:"#dc2626" };
}
function getRiasecStatus(score: float) {
  if (score > 80) return { label:"Highly Dominant", bg:"#fce7f3", color:"#be185d" };
  if (score > 60) return { label:"Dominant",        bg:"#dcfce7", color:"#16a34a" };
  if (score > 40) return { label:"Avg Dominant",    bg:"#fef9c3", color:"#ca8a04" };
  return               { label:"Less Dominant",  bg:"#f1f5f9", color:"#64748b" };
}

// ── Confidence label helper ──────────────────────────────────────────────────
function getConfidenceLabel(pct: number): { label: string; bg: string; color: string } {
  if (pct >= 80) return { label: "Very High", bg: "#dcfce7", color: "#16a34a" };
  if (pct >= 60) return { label: "High",      bg: "#dbeafe", color: "#2563eb" };
  if (pct >= 40) return { label: "Moderate",  bg: "#fef9c3", color: "#ca8a04" };
  return               { label: "Low",       bg: "#fee2e2", color: "#dc2626" };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [result,  setResult]  = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [pdfLoad, setPdfLoad] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    getMyResult()
      .then((r) => setResult(r.data))
      .catch(() => setError("Could not load report. Please complete the test first."))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    router.push("/");
  };

  const handlePDF = async () => {
    setPdfLoad(true);
    try {
      const res  = await downloadPDF();
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `psychometric_report_${result?.user?.name?.replace(/ /g, "_") || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed. Please try again.");
    } finally {
      setPdfLoad(false);
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, border:"4px solid #667eea", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#666", fontSize:16 }}>Loading your report...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error || !result) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:"center", background:"white", padding:"48px", borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
        <h2 style={{ color:"#1e293b", fontWeight:700, marginBottom:8 }}>No Report Found</h2>
        <p style={{ color:"#64748b", marginBottom:24 }}>{error || "Please complete the test first."}</p>
        <button onClick={() => router.push("/test")} style={{ padding:"12px 32px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:15, fontFamily:"inherit" }}>
          Take Test →
        </button>
      </div>
    </div>
  );

  // ── Data preparation ─────────────────────────────────────────────────────
  const intelData = [
    { subject:"Logical",       score: result.intelligence.logical_mathematical },
    { subject:"Interpersonal", score: result.intelligence.interpersonal        },
    { subject:"Bodily",        score: result.intelligence.bodily_kinesthetic   },
    { subject:"Linguistic",    score: result.intelligence.verbal_linguistic    },
    { subject:"Musical",       score: result.intelligence.musical              },
    { subject:"Naturalist",    score: result.intelligence.naturalist           },
    { subject:"Spatial",       score: result.intelligence.spatial_visual       },
    { subject:"Intrapersonal", score: result.intelligence.intrapersonal        },
  ].sort((a, b) => b.score - a.score);

  const riasecData = [
    { name:"Realistic",     score: result.riasec.realistic     },
    { name:"Investigative", score: result.riasec.investigative },
    { name:"Artistic",      score: result.riasec.artistic      },
    { name:"Social",        score: result.riasec.social        },
    { name:"Enterprising",  score: result.riasec.enterprising  },
    { name:"Conventional",  score: result.riasec.conventional  },
  ].sort((a, b) => b.score - a.score);

  const topIntel  = intelData[0];
  const topRiasec = riasecData[0];

  // ── Normalise top_careers ────────────────────────────────────────────────
  // API may return top_careers[] (new) or just top_career string (old).
  // We always work with a normalised array of max 5 entries.
  const topCareers: TopCareerEntry[] = (() => {
    if (result.top_careers && result.top_careers.length > 0) {
      return result.top_careers.slice(0, 5);
    }
    // Fallback: wrap the single top_career string with 100% confidence
    return result.top_career
      ? [{ career: result.top_career, confidence: 100 }]
      : [];
  })();

  const completedDate = result.completed_at
    ? new Date(result.completed_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
    : "";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* ── Navbar ── */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>🧠</span>
          <span style={{ fontWeight:700, fontSize:18, color:"#1a1a2e" }}>Psychometric Report</span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={handlePDF} disabled={pdfLoad}
            style={{ padding:"10px 18px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:10, fontWeight:600, cursor:pdfLoad?"not-allowed":"pointer", fontSize:14, fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, opacity:pdfLoad?0.7:1 }}
          >
            {pdfLoad ? (
              <><div style={{ width:14, height:14, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>Generating...</>
            ) : "⬇ Download PDF"}
          </button>
          <button onClick={() => router.push("/dashboard")} style={{ padding:"10px 18px", background:"#f1f5f9", color:"#374151", border:"2px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
            ← Dashboard
          </button>
          <button onClick={handleLogout} style={{ padding:"10px 18px", background:"white", color:"#ef4444", border:"2px solid #fecaca", borderRadius:10, fontWeight:600, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>

        {/* ── Student Info ── */}
        <div style={{ background:"white", borderRadius:20, padding:"24px 32px", marginBottom:24, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:20 }}>
              {result.user.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h2 style={{ margin:0, fontWeight:800, fontSize:19, color:"#1e293b" }}>{result.user.name}</h2>
              <p style={{ margin:"2px 0 0", color:"#94a3b8", fontSize:13 }}>{result.user.email}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {result.user.school && (
              <div>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>School</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:14 }}>{result.user.school}</p>
              </div>
            )}
            {result.user.student_class && (
              <div>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Class</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:14 }}>{result.user.student_class}</p>
              </div>
            )}
            {completedDate && (
              <div>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Completed</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:14 }}>{completedDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Career Hero ── */}
        <div style={{ background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)", borderRadius:20, padding:"40px 48px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 8px 32px rgba(102,126,234,0.35)", flexWrap:"wrap", gap:20 }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>🎯 Recommended Career Path</p>
            <h1 style={{ fontSize:34, fontWeight:800, color:"white", margin:"0 0 10px" }}>
              {topCareers[0]?.career || result.top_career}
            </h1>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:14, margin:"0 0 20px" }}>Based on your psychometric profile and RIASEC personality analysis</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"8px 16px" }}>
                <span style={{ color:"white", fontSize:13, fontWeight:600 }}>🧠 Top Intelligence: {topIntel.subject}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"8px 16px" }}>
                <span style={{ color:"white", fontSize:13, fontWeight:600 }}>⭐ Top Personality: {topRiasec.name}</span>
              </div>
              {topCareers[0] && (
                <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"8px 16px" }}>
                  <span style={{ color:"white", fontSize:13, fontWeight:600 }}>✅ Confidence: {topCareers[0].confidence.toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize:80, opacity:0.8 }}>🎯</div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            ── TOP 5 CAREER RECOMMENDATIONS ──
        ════════════════════════════════════════════════════════════════════ */}
        {topCareers.length > 0 && (
          <div style={{ background:"white", borderRadius:20, padding:"28px 32px", marginBottom:24, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            {/* Section Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:8 }}>
              <div>
                <h3 style={{ fontWeight:800, color:"#1e293b", fontSize:18, margin:"0 0 4px" }}>
                  🏆 Top {topCareers.length} Career Recommendations
                </h3>
                <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>
                  Ranked by AI-predicted fit confidence based on your full psychometric profile
                </p>
              </div>
              <div style={{ background:"linear-gradient(135deg,#667eea15,#764ba215)", border:"1.5px solid #667eea30", borderRadius:10, padding:"6px 14px" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#667eea" }}>AI POWERED RANKING</span>
              </div>
            </div>

            {/* Career Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {topCareers.map((entry, idx) => {
                const grad    = CAREER_GRADIENTS[idx] ?? CAREER_GRADIENTS[4];
                const confLbl = getConfidenceLabel(entry.confidence);
                const icon    = getCareerIcon(entry.career);
                const isTop   = idx === 0;

                return (
                  <div
                    key={idx}
                    style={{
                      display:"flex", alignItems:"center", gap:18,
                      padding: isTop ? "22px 24px" : "16px 20px",
                      borderRadius:16,
                      background: isTop
                        ? `linear-gradient(135deg, ${grad.from}12, ${grad.to}08)`
                        : "#f8fafc",
                      border: isTop
                        ? `2px solid ${grad.from}40`
                        : "2px solid #f1f5f9",
                      position:"relative",
                      overflow:"hidden",
                      transition:"box-shadow 0.2s",
                    }}
                  >
                    {/* Rank number — decorative background */}
                    <div style={{
                      position:"absolute", right:20, top:"50%", transform:"translateY(-50%)",
                      fontSize: isTop ? 72 : 52,
                      fontWeight:900,
                      color: grad.from + "0d",
                      lineHeight:1,
                      userSelect:"none",
                      pointerEvents:"none",
                    }}>
                      #{idx + 1}
                    </div>

                    {/* Rank badge */}
                    <div style={{
                      width: isTop ? 52 : 42, height: isTop ? 52 : 42,
                      borderRadius:14,
                      background:`linear-gradient(135deg,${grad.from},${grad.to})`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize: isTop ? 22 : 18,
                      flexShrink:0,
                      boxShadow:`0 4px 12px ${grad.from}50`,
                    }}>
                      {icon}
                    </div>

                    {/* Career name + rank label */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: isTop ? 8 : 6 }}>
                        <span style={{
                          fontWeight: isTop ? 800 : 700,
                          fontSize: isTop ? 17 : 15,
                          color:"#1e293b",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                        }}>
                          {entry.career}
                        </span>
                        <span style={{
                          background:`linear-gradient(135deg,${grad.from},${grad.to})`,
                          color:"white",
                          padding:"2px 10px", borderRadius:20,
                          fontSize:11, fontWeight:700,
                          flexShrink:0,
                        }}>
                          {RANK_LABELS[idx]}
                        </span>
                      </div>

                      {/* Confidence progress bar */}
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ flex:1, height: isTop ? 10 : 7, background:"#e2e8f0", borderRadius:99, overflow:"hidden" }}>
                          <div style={{
                            height:"100%",
                            width:`${entry.confidence}%`,
                            background:`linear-gradient(90deg,${grad.from},${grad.to})`,
                            borderRadius:99,
                            transition:"width 1s ease",
                          }}/>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <span style={{ fontWeight:800, color:"#1e293b", fontSize: isTop ? 16 : 14 }}>
                            {entry.confidence.toFixed(0)}%
                          </span>
                          <span style={{
                            background: confLbl.bg, color: confLbl.color,
                            padding:"2px 8px", borderRadius:20,
                            fontSize:11, fontWeight:700,
                          }}>
                            {confLbl.label}
                          </span>
                        </div>
                      </div>
                      {isTop && (
                        <p style={{ margin:"6px 0 0", fontSize:12, color:"#64748b" }}>
                          ✨ Strongest career match based on your intelligence profile, RIASEC personality & interest patterns
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend / note */}
            <div style={{ marginTop:18, padding:"12px 16px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <p style={{ margin:0, fontSize:12, color:"#64748b", lineHeight:1.6 }}>
                <strong style={{ color:"#374151" }}>ℹ️ How confidence is calculated:</strong> The percentage reflects how strongly your combined Multiple Intelligence scores and RIASEC personality traits align with each career's typical professional profile.
              </p>
            </div>
          </div>
        )}

        {/* ── Charts ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
          <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>Multiple Intelligences</h3>
            <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 16px" }}>Gardner's Theory</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={intelData}>
                <PolarGrid stroke="#f1f5f9"/>
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:12, fill:"#64748b" }}/>
                <Radar dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.25} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>RIASEC Personality</h3>
            <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 16px" }}>Holland's Occupational Themes</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riasecData} layout="vertical" margin={{ left:10, right:20 }}>
                <XAxis type="number" domain={[0,100]} tick={{ fontSize:11, fill:"#94a3b8" }}/>
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize:12, fill:"#64748b" }}/>
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Score"]}/>
                <Bar dataKey="score" radius={[0,8,8,0]}>
                  {riasecData.map((_,i) => <Cell key={i} fill={RIASEC_COLORS[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Intelligence Breakdown ── */}
        <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>Intelligence Score Breakdown</h3>
          <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 20px" }}>Sorted by strength — highest to lowest</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {intelData.map((item, i) => {
              const status = getStatus(item.score);
              const color  = INTEL_COLORS[item.subject] || "#667eea";
              const icon   = INTEL_ICONS[item.subject]  || "⭐";
              return (
                <div key={item.subject} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background: i === 0 ? "#f8f7ff" : "#f8fafc", borderRadius:12, border: i === 0 ? "2px solid #667eea30" : "2px solid transparent" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>
                    {icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontWeight:600, color:"#374151", fontSize:14 }}>{item.subject}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontWeight:700, color:"#1e293b", fontSize:14 }}>{item.score.toFixed(0)}%</span>
                        <span style={{ background:status.bg, color:status.color, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>{status.label}</span>
                      </div>
                    </div>
                    <div style={{ height:8, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${item.score}%`, background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:4 }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIASEC Cards ── */}
        <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:28 }}>
          <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>RIASEC Personality Profile</h3>
          <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 20px" }}>Holland's six personality types — sorted by dominance</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {riasecData.map((item, i) => {
              const info   = RIASEC_INFO[item.name] || { icon:"⭐", desc:"" };
              const status = getRiasecStatus(item.score);
              return (
                <div key={item.name} style={{ padding:"20px", borderRadius:14, background: i === 0 ? "linear-gradient(135deg,#667eea08,#764ba208)" : "#f8fafc", border: i === 0 ? "2px solid #667eea30" : "2px solid #f1f5f9" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:26 }}>{info.icon}</span>
                    <span style={{ background:status.bg, color:status.color, padding:"3px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>{status.label}</span>
                  </div>
                  <p style={{ fontWeight:700, color:"#1e293b", fontSize:15, margin:"0 0 4px" }}>{item.name}</p>
                  <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 12px" }}>{info.desc}</p>
                  <div style={{ height:8, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.score}%`, background:RIASEC_COLORS[i], borderRadius:4 }}/>
                  </div>
                  <p style={{ fontWeight:700, color:"#374151", fontSize:14, margin:"8px 0 0", textAlign:"right" }}>{item.score.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div style={{ display:"flex", gap:12, justifyContent:"center", paddingBottom:32 }}>
          <button
            onClick={handlePDF} disabled={pdfLoad}
            style={{ padding:"14px 32px", borderRadius:12, background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", fontWeight:700, fontSize:15, cursor:pdfLoad?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, opacity:pdfLoad?0.7:1 }}
          >
            {pdfLoad ? "Generating PDF..." : "⬇ Download PDF Report"}
          </button>
          <button onClick={() => router.push("/dashboard")} style={{ padding:"14px 32px", borderRadius:12, background:"white", color:"#374151", border:"2px solid #e2e8f0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} style={{ padding:"14px 32px", borderRadius:12, background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
            Logout
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}