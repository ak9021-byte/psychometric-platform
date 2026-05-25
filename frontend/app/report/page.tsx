"use client";
import { useEffect, useState } from "react";
import { getMyResult, downloadPDF } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

type float = number;

type TopCareerEntry = {
  career: string;
  confidence: number;
  title?: string;
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
  top_career:   string;
  top_careers?: TopCareerEntry[];
  top_5_careers?: any[];
  completed_at: string;
};

const CAREER_ICONS: Record<string, string> = {
  default: "💼", engineer: "⚙️", doctor: "🩺", teacher: "📚",
  lawyer: "⚖️", scientist: "🔬", artist: "🎨", architect: "🏛️",
  nurse: "💊", psychologist: "🧠", accountant: "📊", designer: "✏️",
  writer: "✍️", musician: "🎵", researcher: "🔭", manager: "📋",
  programmer: "💻", developer: "💻", software: "💻", data: "📈",
  analyst: "📉", business: "📦", entrepreneur: "🚀", social: "🤝",
  counselor: "💬", therapist: "🫶", biologist: "🌿", chemist: "⚗️",
  physicist: "⚛️", music: "🎵", producer: "🎙️", sound: "🔊",
};

function getCareerIcon(careerName: string): string {
  const lower = careerName.toLowerCase();
  for (const [key, icon] of Object.entries(CAREER_ICONS)) {
    if (key !== "default" && lower.includes(key)) return icon;
  }
  return CAREER_ICONS.default;
}

const CAREER_GRADIENTS = [
  { from: "#667eea", to: "#764ba2" },
  { from: "#11998e", to: "#38ef7d" },
  { from: "#f7971e", to: "#ffd200" },
  { from: "#ef4444", to: "#f97316" },
  { from: "#06b6d4", to: "#3b82f6" },
];
const RANK_LABELS = ["🥇 Best Fit", "🥈 Great Fit", "🥉 Strong Fit", "4th", "5th"];

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
function getConfidenceLabel(pct: number) {
  if (pct >= 80) return { label:"Very High", bg:"#dcfce7", color:"#16a34a" };
  if (pct >= 60) return { label:"High",      bg:"#dbeafe", color:"#2563eb" };
  if (pct >= 40) return { label:"Moderate",  bg:"#fef9c3", color:"#ca8a04" };
  return               { label:"Low",       bg:"#fee2e2", color:"#dc2626" };
}

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
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif", padding:"20px" }}>
      <div style={{ textAlign:"center", background:"white", padding:"48px 32px", borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", width:"100%", maxWidth:400 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
        <h2 style={{ color:"#1e293b", fontWeight:700, marginBottom:8 }}>No Report Found</h2>
        <p style={{ color:"#64748b", marginBottom:24 }}>{error || "Please complete the test first."}</p>
        <button onClick={() => router.push("/test")} style={{ padding:"12px 32px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:15, fontFamily:"inherit" }}>
          Take Test →
        </button>
      </div>
    </div>
  );

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

  const topCareers: TopCareerEntry[] = (() => {
    const raw = (result as any).top_5_careers || result.top_careers || [];
    if (raw.length > 0) {
      return raw.slice(0, 5).map((c: any) => ({
        career: c.title || c.career || "",
        confidence: c.confidence || 0,
      }));
    }
    return result.top_career
      ? [{ career: result.top_career, confidence: 100 }]
      : [];
  })();

  const completedDate = result.completed_at
    ? new Date(result.completed_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
    : "";

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Navbar ── */
        .report-nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          position: sticky;
          top: 0;
          z-index: 10;
          gap: 8px;
          flex-wrap: wrap;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
          color: #1a1a2e;
        }
        .nav-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-pdf {
          padding: 9px 14px;
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .btn-dash {
          padding: 9px 14px;
          background: #f1f5f9;
          color: #374151;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          white-space: nowrap;
        }
        .btn-logout {
          padding: 9px 14px;
          background: white;
          color: #ef4444;
          border: 2px solid #fecaca;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          white-space: nowrap;
        }

        /* ── Page wrapper ── */
        .page-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 12px 32px;
        }
        @media (min-width: 640px) {
          .page-wrap { padding: 28px 20px 40px; }
          .report-nav { padding: 14px 24px; }
          .nav-brand { font-size: 17px; }
          .btn-pdf, .btn-dash, .btn-logout { font-size: 14px; padding: 10px 18px; }
        }

        /* ── Student info card ── */
        .student-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        }
        .student-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .student-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media (min-width: 640px) {
          .student-card {
            padding: 20px 28px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }
          .student-top { margin-bottom: 0; }
        }

        /* ── Career Hero ── */
        .career-hero {
          background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          border-radius: 16px;
          padding: 24px 20px;
          margin-bottom: 16px;
          box-shadow: 0 8px 32px rgba(102,126,234,0.35);
        }
        .career-hero-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .career-hero-emoji {
          font-size: 48px;
          opacity: 0.8;
          flex-shrink: 0;
        }
        .career-title {
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .career-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
        }
        .career-badge {
          background: rgba(255,255,255,0.18);
          border-radius: 8px;
          padding: 6px 12px;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        @media (min-width: 640px) {
          .career-hero { padding: 36px 40px; margin-bottom: 20px; }
          .career-title { font-size: 30px; }
          .career-hero-emoji { font-size: 72px; }
          .career-badge { font-size: 13px; padding: 8px 16px; }
        }

        /* ── Section card ── */
        .section-card {
          background: white;
          border-radius: 16px;
          padding: 20px 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        }
        @media (min-width: 640px) {
          .section-card { padding: 28px 28px; margin-bottom: 20px; }
        }

        /* ── Charts grid ── */
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (min-width: 700px) {
          .charts-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
        }

        /* ── Intelligence grid ── */
        .intel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 600px) {
          .intel-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── RIASEC grid ── */
        .riasec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (min-width: 700px) {
          .riasec-grid { grid-template-columns: repeat(3,1fr); gap: 12px; }
        }

        /* ── Career cards ── */
        .career-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .career-card { padding: 20px 22px; gap: 18px; }
        }

        /* ── Footer buttons ── */
        .footer-btns {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 24px;
        }
        @media (min-width: 500px) {
          .footer-btns {
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
          }
        }
        .footer-btn {
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          text-align: center;
          border: none;
        }
        @media (min-width: 640px) {
          .footer-btn { font-size: 15px; padding: 14px 32px; }
        }

        /* ── Section header ── */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .section-title {
          font-weight: 800;
          color: #1e293b;
          font-size: 16px;
          margin: 0 0 3px;
        }
        .section-sub {
          color: #94a3b8;
          font-size: 12px;
          margin: 0;
        }
        @media (min-width: 640px) {
          .section-title { font-size: 18px; }
          .section-sub { font-size: 13px; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <div className="report-nav">
        <div className="nav-brand">
          <span style={{ fontSize:22 }}>🧠</span>
          <span>Psychometric Report</span>
        </div>
        <div className="nav-actions">
          <button onClick={handlePDF} disabled={pdfLoad} className="btn-pdf" style={{ opacity: pdfLoad ? 0.7 : 1 }}>
            {pdfLoad
              ? <><div style={{ width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Generating...</>
              : "⬇ Download PDF"}
          </button>
          <button onClick={() => router.push("/dashboard")} className="btn-dash">← Dashboard</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="page-wrap">

        {/* ── Student Info ── */}
        <div className="student-card">
          <div className="student-top">
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:18, flexShrink:0 }}>
              {result.user.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h2 style={{ margin:0, fontWeight:800, fontSize:17, color:"#1e293b" }}>{result.user.name}</h2>
              <p style={{ margin:"2px 0 0", color:"#94a3b8", fontSize:12 }}>{result.user.email}</p>
            </div>
          </div>
          <div className="student-meta">
            {result.user.school && (
              <div>
                <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>School</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{result.user.school}</p>
              </div>
            )}
            {result.user.student_class && (
              <div>
                <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Class</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{result.user.student_class}</p>
              </div>
            )}
            {completedDate && (
              <div>
                <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Completed</p>
                <p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{completedDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Career Hero ── */}
        <div className="career-hero">
          <div className="career-hero-inner">
            <div style={{ flex:1 }}>
              <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:6, textTransform:"uppercase" }}>🎯 Recommended Career Path</p>
              <h1 className="career-title">{topCareers[0]?.career || result.top_career}</h1>
              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:0 }}>Based on your psychometric profile and RIASEC personality analysis</p>
              <div className="career-badges">
                <div className="career-badge">🧠 Top Intelligence: {topIntel.subject}</div>
                <div className="career-badge">⭐ Top Personality: {topRiasec.name}</div>
                {topCareers[0] && (
                  <div className="career-badge">✅ Confidence: {topCareers[0].confidence.toFixed(0)}%</div>
                )}
              </div>
            </div>
            <div className="career-hero-emoji">🎯</div>
          </div>
        </div>

        {/* ── Top Career Recommendations ── */}
        {topCareers.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <h3 className="section-title">🏆 Top {topCareers.length} Career Recommendations</h3>
                <p className="section-sub">Ranked by AI-predicted fit confidence based on your full psychometric profile</p>
              </div>
              <div style={{ background:"linear-gradient(135deg,#667eea15,#764ba215)", border:"1.5px solid #667eea30", borderRadius:10, padding:"5px 12px", flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#667eea" }}>AI POWERED RANKING</span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {topCareers.map((entry, idx) => {
                const grad    = CAREER_GRADIENTS[idx] ?? CAREER_GRADIENTS[4];
                const confLbl = getConfidenceLabel(entry.confidence);
                const icon    = getCareerIcon(entry.career);
                const isTop   = idx === 0;
                return (
                  <div key={idx} className="career-card" style={{
                    background: isTop ? `linear-gradient(135deg, ${grad.from}12, ${grad.to}08)` : "#f8fafc",
                    border: isTop ? `2px solid ${grad.from}40` : "2px solid #f1f5f9",
                  }}>
                    {/* Decorative rank number */}
                    <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize: isTop ? 56 : 42, fontWeight:900, color: grad.from + "0d", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>
                      #{idx+1}
                    </div>
                    {/* Icon badge */}
                    <div style={{ width: isTop ? 48 : 40, height: isTop ? 48 : 40, borderRadius:12, background:`linear-gradient(135deg,${grad.from},${grad.to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize: isTop ? 20 : 17, flexShrink:0, boxShadow:`0 4px 12px ${grad.from}50` }}>
                      {icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontWeight: isTop ? 800 : 700, fontSize: isTop ? 15 : 14, color:"#1e293b" }}>
                          {entry.career}
                        </span>
                        <span style={{ background:`linear-gradient(135deg,${grad.from},${grad.to})`, color:"white", padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, flexShrink:0 }}>
                          {RANK_LABELS[idx]}
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height: isTop ? 9 : 6, background:"#e2e8f0", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${entry.confidence}%`, background:`linear-gradient(90deg,${grad.from},${grad.to})`, borderRadius:99 }}/>
                        </div>
                        <span style={{ fontWeight:800, color:"#1e293b", fontSize: isTop ? 15 : 13, flexShrink:0 }}>{entry.confidence.toFixed(0)}%</span>
                        <span style={{ background:confLbl.bg, color:confLbl.color, padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:700, flexShrink:0 }}>{confLbl.label}</span>
                      </div>
                      {isTop && (
                        <p style={{ margin:"6px 0 0", fontSize:11, color:"#64748b" }}>
                          ✨ Strongest career match based on your intelligence profile, RIASEC personality & interest patterns
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:16, padding:"10px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <p style={{ margin:0, fontSize:11, color:"#64748b", lineHeight:1.6 }}>
                <strong style={{ color:"#374151" }}>ℹ️ How confidence is calculated:</strong> The percentage reflects how strongly your combined Multiple Intelligence scores and RIASEC personality traits align with each career's typical professional profile.
              </p>
            </div>
          </div>
        )}

        {/* ── Charts ── */}
        <div className="charts-grid">
          <div className="section-card" style={{ marginBottom:0 }}>
            <h3 className="section-title">Multiple Intelligences</h3>
            <p className="section-sub" style={{ marginBottom:12 }}>Gardner's Theory</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={intelData}>
                <PolarGrid stroke="#f1f5f9"/>
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:"#64748b" }}/>
                <Radar dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.25} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-card" style={{ marginBottom:0 }}>
            <h3 className="section-title">RIASEC Personality</h3>
            <p className="section-sub" style={{ marginBottom:12 }}>Holland's Occupational Themes</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riasecData} layout="vertical" margin={{ left:0, right:16 }}>
                <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fill:"#94a3b8" }}/>
                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize:11, fill:"#64748b" }}/>
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Score"]}/>
                <Bar dataKey="score" radius={[0,6,6,0]}>
                  {riasecData.map((_,i) => <Cell key={i} fill={RIASEC_COLORS[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Intelligence Breakdown ── */}
        <div className="section-card">
          <h3 className="section-title">Intelligence Score Breakdown</h3>
          <p className="section-sub" style={{ marginBottom:16 }}>Sorted by strength — highest to lowest</p>
          <div className="intel-grid">
            {intelData.map((item, i) => {
              const status = getStatus(item.score);
              const color  = INTEL_COLORS[item.subject] || "#667eea";
              const icon   = INTEL_ICONS[item.subject]  || "⭐";
              return (
                <div key={item.subject} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 14px", background: i === 0 ? "#f8f7ff" : "#f8fafc", borderRadius:12, border: i === 0 ? "2px solid #667eea30" : "2px solid transparent" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>
                    {icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, gap:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:600, color:"#374151", fontSize:13 }}>{item.subject}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontWeight:700, color:"#1e293b", fontSize:13 }}>{item.score.toFixed(0)}%</span>
                        <span style={{ background:status.bg, color:status.color, padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:700 }}>{status.label}</span>
                      </div>
                    </div>
                    <div style={{ height:7, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${item.score}%`, background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:4 }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIASEC Cards ── */}
        <div className="section-card">
          <h3 className="section-title">RIASEC Personality Profile</h3>
          <p className="section-sub" style={{ marginBottom:16 }}>Holland's six personality types — sorted by dominance</p>
          <div className="riasec-grid">
            {riasecData.map((item, i) => {
              const info   = RIASEC_INFO[item.name] || { icon:"⭐", desc:"" };
              const status = getRiasecStatus(item.score);
              return (
                <div key={item.name} style={{ padding:"16px 14px", borderRadius:12, background: i === 0 ? "linear-gradient(135deg,#667eea08,#764ba208)" : "#f8fafc", border: i === 0 ? "2px solid #667eea30" : "2px solid #f1f5f9" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:22 }}>{info.icon}</span>
                    <span style={{ background:status.bg, color:status.color, padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:700 }}>{status.label}</span>
                  </div>
                  <p style={{ fontWeight:700, color:"#1e293b", fontSize:14, margin:"0 0 3px" }}>{item.name}</p>
                  <p style={{ color:"#94a3b8", fontSize:11, margin:"0 0 10px", lineHeight:1.4 }}>{info.desc}</p>
                  <div style={{ height:7, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.score}%`, background:RIASEC_COLORS[i], borderRadius:4 }}/>
                  </div>
                  <p style={{ fontWeight:700, color:"#374151", fontSize:13, margin:"6px 0 0", textAlign:"right" }}>{item.score.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="footer-btns">
          <button onClick={handlePDF} disabled={pdfLoad} className="footer-btn" style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", opacity:pdfLoad?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {pdfLoad ? "Generating PDF..." : "⬇ Download PDF Report"}
          </button>
          <button onClick={() => router.push("/dashboard")} className="footer-btn" style={{ background:"white", color:"#374151", border:"2px solid #e2e8f0" }}>
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="footer-btn" style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white" }}>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}