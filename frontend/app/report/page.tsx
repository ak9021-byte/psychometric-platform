"use client";
import { useEffect, useState } from "react";
import { getMyResult, downloadPDF } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

type float = number;
type TopCareerEntry = { title?: string; career?: string; confidence: float };
type Result = {
  user: { name: string; email: string; school: string; student_class: string; father_name: string; mother_name: string };
  intelligence: { logical_mathematical: float; interpersonal: float; bodily_kinesthetic: float; verbal_linguistic: float; musical: float; naturalist: float; spatial_visual: float; intrapersonal: float };
  riasec: { realistic: float; investigative: float; artistic: float; social: float; enterprising: float; conventional: float };
  top_career: string;
  top_careers?: TopCareerEntry[];
  top_5_careers?: any[];
  personality_clarity?: string;
  trait_variance?: float;
  completed_at: string;
};

const CAREER_ICONS: Record<string, string> = {
  default:"💼", engineer:"⚙️", doctor:"🩺", teacher:"📚", lawyer:"⚖️",
  scientist:"🔬", artist:"🎨", architect:"🏛️", nurse:"💊", psychologist:"🧠",
  accountant:"📊", designer:"✏️", writer:"✍️", musician:"🎵", researcher:"🔭",
  manager:"📋", programmer:"💻", developer:"💻", software:"💻", data:"📈",
  analyst:"📉", business:"📦", entrepreneur:"🚀", social:"🤝", counselor:"💬",
  therapist:"🫶", pilot:"✈️", army:"🎖️", defence:"🎖️", bank:"🏦",
};
function getCareerIcon(n: string): string {
  const l = n.toLowerCase();
  for (const [k, v] of Object.entries(CAREER_ICONS)) { if (k !== "default" && l.includes(k)) return v; }
  return CAREER_ICONS.default;
}

const CAREER_GRADIENTS = [
  { from:"#667eea", to:"#764ba2" }, { from:"#11998e", to:"#38ef7d" },
  { from:"#f7971e", to:"#ffd200" }, { from:"#ef4444", to:"#f97316" },
  { from:"#06b6d4", to:"#3b82f6" },
];
const RANK_LABELS = ["🥇 Best Fit","🥈 Great Fit","🥉 Strong Fit","4th Match","5th Match"];
const INTEL_COLORS: Record<string,string> = { Logical:"#3b82f6", Interpersonal:"#8b5cf6", Bodily:"#10b981", Linguistic:"#f59e0b", Musical:"#ec4899", Naturalist:"#06b6d4", Spatial:"#f97316", Intrapersonal:"#6366f1" };
const INTEL_ICONS: Record<string,string> = { Logical:"🧮", Interpersonal:"🤝", Bodily:"🏃", Linguistic:"📝", Musical:"🎵", Naturalist:"🌿", Spatial:"👁️", Intrapersonal:"🧘" };
const RIASEC_COLORS = ["#667eea","#764ba2","#10b981","#f59e0b","#ef4444","#06b6d4"];
const RIASEC_INFO: Record<string,{icon:string;desc:string}> = {
  Realistic:{icon:"🔧",desc:"The Doers — practical, hands-on"}, Investigative:{icon:"🔬",desc:"The Thinkers — analytical, curious"},
  Artistic:{icon:"🎨",desc:"The Creators — imaginative, expressive"}, Social:{icon:"🤝",desc:"The Helpers — caring, cooperative"},
  Enterprising:{icon:"💼",desc:"The Persuaders — ambitious, leaders"}, Conventional:{icon:"📋",desc:"The Organizers — detail-oriented"},
};

function getStatus(s: float) {
  if (s >= 75) return { label:"Excellent", bg:"#dcfce7", color:"#16a34a" };
  if (s >= 60) return { label:"Very Good", bg:"#dbeafe", color:"#2563eb" };
  if (s >= 45) return { label:"Good",      bg:"#fef9c3", color:"#ca8a04" };
  return             { label:"Needs Work", bg:"#fee2e2", color:"#dc2626" };
}
function getRiasecStatus(s: float) {
  if (s > 80) return { label:"Highly Dominant", bg:"#fce7f3", color:"#be185d" };
  if (s > 60) return { label:"Dominant",        bg:"#dcfce7", color:"#16a34a" };
  if (s > 40) return { label:"Avg Dominant",    bg:"#fef9c3", color:"#ca8a04" };
  return             { label:"Less Dominant",   bg:"#f1f5f9", color:"#64748b" };
}
function getConfLabel(p: number) {
  if (p >= 80) return { label:"Very High", bg:"#dcfce7", color:"#16a34a" };
  if (p >= 60) return { label:"High",      bg:"#dbeafe", color:"#2563eb" };
  if (p >= 40) return { label:"Moderate",  bg:"#fef9c3", color:"#ca8a04" };
  return             { label:"Low",        bg:"#fee2e2", color:"#dc2626" };
}
function getClarityColor(c: string) {
  if (c === "Strongly Defined")   return { bg:"#dcfce7", color:"#16a34a" };
  if (c === "Moderately Defined") return { bg:"#dbeafe", color:"#2563eb" };
  return                          { bg:"#fef9c3", color:"#ca8a04" };
}

export default function ReportPage() {
  const [result,  setResult]  = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [pdfLoad, setPdfLoad] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    getMyResult().then(r => setResult(r.data)).catch(() => setError("Could not load report.")).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  const handlePDF = async () => {
    setPdfLoad(true);
    try {
      const res = await downloadPDF();
      const url = window.URL.createObjectURL(new Blob([res.data], { type:"application/pdf" }));
      const a   = document.createElement("a");
      a.href = url; a.download = `report_${result?.user?.name?.replace(/ /g,"_") || "report"}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert("PDF download failed."); }
    finally { setPdfLoad(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:56, height:56, border:"4px solid #667eea", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#666" }}>Loading your report...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error || !result) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif", padding:20 }}>
      <div style={{ textAlign:"center", background:"white", padding:"40px 32px", borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", maxWidth:400, width:"100%" }}>
        <div style={{ fontSize:48, marginBottom:14 }}>📋</div>
        <h2 style={{ color:"#1e293b", fontWeight:700, marginBottom:8 }}>No Report Found</h2>
        <p style={{ color:"#64748b", marginBottom:20 }}>{error || "Please complete the test first."}</p>
        <button onClick={() => router.push("/test")} style={{ padding:"12px 28px", background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:15, fontFamily:"inherit", width:"100%" }}>Take Test →</button>
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

  const topCareers = (() => {
    const raw = (result as any).top_5_careers || result.top_careers || [];
    if (raw.length > 0) return raw.slice(0,5).map((c: any) => ({ career: c.title || c.career || "", confidence: c.confidence || 0 }));
    return result.top_career ? [{ career: result.top_career, confidence: 95 }] : [];
  })();

  const completedDate = result.completed_at ? new Date(result.completed_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "";
  const clarity       = result.personality_clarity || "Moderately Defined";
  const clarityColor  = getClarityColor(clarity);

  const FF = "'Segoe UI',sans-serif";

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:FF }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        /* ── Mobile Responsive ── */
        .rp-navbar   { padding: 12px 20px; }
        .rp-nav-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .rp-nav-btn  { padding: 8px 12px; font-size: 13px; }
        .rp-content  { padding: 20px 14px; max-width: 1100px; margin: 0 auto; }
        .rp-student  { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .rp-hero     { padding: 28px 24px; }
        .rp-hero-h1  { font-size: 26px; }
        .rp-hero-badges { display: flex; gap: 10px; flex-wrap: wrap; }
        .rp-charts   { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .rp-intel    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rp-riasec   { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .rp-footer   { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding-bottom: 32px; }
        .rp-footer-btn { padding: 14px 24px; font-size: 14px; }
        .rp-career-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        @media (max-width: 768px) {
          .rp-navbar   { padding: 10px 14px; }
          .rp-nav-btn  { padding: 7px 10px !important; font-size: 12px !important; }
          .rp-content  { padding: 16px 12px; }
          .rp-student  { flex-direction: column; align-items: flex-start; }
          .rp-hero     { padding: 20px 18px !important; }
          .rp-hero-h1  { font-size: 20px !important; }
          .rp-charts   { grid-template-columns: 1fr !important; }
          .rp-intel    { grid-template-columns: 1fr !important; }
          .rp-riasec   { grid-template-columns: 1fr 1fr !important; }
          .rp-footer   { flex-direction: column; }
          .rp-footer-btn { width: 100% !important; text-align: center; }
          .rp-career-name { white-space: normal !important; font-size: 14px !important; }
          .rp-hide-mobile { display: none !important; }
          .rp-section  { padding: 20px 16px !important; }
        }

        @media (max-width: 480px) {
          .rp-riasec   { grid-template-columns: 1fr !important; }
          .rp-hero-h1  { font-size: 18px !important; }
          .rp-nav-title { font-size: 14px !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <div className="rp-navbar" style={{ background:"white", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22 }}>🧠</span>
          <span className="rp-nav-title" style={{ fontWeight:700, fontSize:17, color:"#1a1a2e" }}>Psychometric Report</span>
        </div>
        <div className="rp-nav-btns">
          <button className="rp-nav-btn" onClick={handlePDF} disabled={pdfLoad}
            style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", borderRadius:10, fontWeight:600, cursor:pdfLoad?"not-allowed":"pointer", fontFamily:FF, display:"flex", alignItems:"center", gap:5, opacity:pdfLoad?0.7:1 }}>
            {pdfLoad ? (<><div style={{ width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>...</>) : "⬇ PDF"}
          </button>
          <button className="rp-nav-btn" onClick={() => router.push("/dashboard")}
            style={{ background:"#f1f5f9", color:"#374151", border:"2px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer", fontFamily:FF }}>← Dashboard</button>
          <button className="rp-nav-btn" onClick={handleLogout}
            style={{ background:"white", color:"#ef4444", border:"2px solid #fecaca", borderRadius:10, fontWeight:600, cursor:"pointer", fontFamily:FF }}>Logout</button>
        </div>
      </div>

      <div className="rp-content">

        {/* ── Student Info ── */}
        <div className="rp-section rp-student" style={{ background:"white", borderRadius:20, padding:"20px 24px", marginBottom:20, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:18, flexShrink:0 }}>
              {result.user.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h2 style={{ margin:0, fontWeight:800, fontSize:17, color:"#1e293b" }}>{result.user.name}</h2>
              <p style={{ margin:"2px 0 0", color:"#94a3b8", fontSize:12 }}>{result.user.email}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:4 }}>
            {result.user.school && <div><p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>School</p><p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{result.user.school}</p></div>}
            {result.user.student_class && <div><p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Class</p><p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{result.user.student_class}</p></div>}
            {completedDate && <div><p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Completed</p><p style={{ margin:"2px 0 0", fontWeight:600, color:"#374151", fontSize:13 }}>{completedDate}</p></div>}
            <div><p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Personality</p><span style={{ background:clarityColor.bg, color:clarityColor.color, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>{clarity}</span></div>
          </div>
        </div>

        {/* ── Career Hero ── */}
        <div className="rp-hero" style={{ background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)", borderRadius:20, marginBottom:20, boxShadow:"0 8px 32px rgba(102,126,234,0.35)" }}>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:6, textTransform:"uppercase" }}>🎯 Recommended Career Path</p>
          <h1 className="rp-hero-h1" style={{ fontWeight:800, color:"white", margin:"0 0 8px" }}>{topCareers[0]?.career || result.top_career}</h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:"0 0 16px" }}>Based on your psychometric profile and RIASEC personality analysis</p>
          <div className="rp-hero-badges">
            <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"6px 12px" }}>
              <span style={{ color:"white", fontSize:12, fontWeight:600 }}>🧠 {topIntel.subject}</span>
            </div>
            <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"6px 12px" }}>
              <span style={{ color:"white", fontSize:12, fontWeight:600 }}>⭐ {topRiasec.name}</span>
            </div>
            {topCareers[0] && (
              <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"6px 12px" }}>
                <span style={{ color:"white", fontSize:12, fontWeight:600 }}>✅ {topCareers[0].confidence.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Top 5 Careers ── */}
        {topCareers.length > 0 && (
          <div className="rp-section" style={{ background:"white", borderRadius:20, padding:"24px", marginBottom:20, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:8 }}>
              <div>
                <h3 style={{ fontWeight:800, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>🏆 Top {topCareers.length} Career Recommendations</h3>
                <p style={{ color:"#94a3b8", fontSize:12, margin:0 }}>Ranked by multi-trait weighted confidence</p>
              </div>
              <div style={{ background:"linear-gradient(135deg,#667eea15,#764ba215)", border:"1.5px solid #667eea30", borderRadius:10, padding:"5px 12px" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#667eea" }}>WEIGHTED RANKING</span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {topCareers.map((entry, idx) => {
                const grad    = CAREER_GRADIENTS[idx] ?? CAREER_GRADIENTS[4];
                const confLbl = getConfLabel(entry.confidence);
                const icon    = getCareerIcon(entry.career);
                const isTop   = idx === 0;
                return (
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:14, padding:isTop?"18px 16px":"14px 16px", borderRadius:14, background:isTop?`linear-gradient(135deg,${grad.from}12,${grad.to}08)`:"#f8fafc", border:isTop?`2px solid ${grad.from}40`:"2px solid #f1f5f9", position:"relative", overflow:"hidden" }}>
                    <div className="rp-hide-mobile" style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:48, fontWeight:900, color:grad.from+"0d", lineHeight:1, userSelect:"none" }}>#{idx+1}</div>
                    <div style={{ width:isTop?44:36, height:isTop?44:36, borderRadius:12, background:`linear-gradient(135deg,${grad.from},${grad.to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:isTop?20:16, flexShrink:0 }}>{icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                        <span className="rp-career-name" style={{ fontWeight:isTop?800:700, fontSize:isTop?15:14, color:"#1e293b" }}>{entry.career}</span>
                        <span style={{ background:`linear-gradient(135deg,${grad.from},${grad.to})`, color:"white", padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, flexShrink:0 }}>{RANK_LABELS[idx]}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height:isTop?8:6, background:"#e2e8f0", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${entry.confidence}%`, background:`linear-gradient(90deg,${grad.from},${grad.to})`, borderRadius:99 }}/>
                        </div>
                        <span style={{ fontWeight:800, color:"#1e293b", fontSize:isTop?14:13, flexShrink:0 }}>{entry.confidence.toFixed(0)}%</span>
                        <span style={{ background:confLbl.bg, color:confLbl.color, padding:"2px 6px", borderRadius:20, fontSize:10, fontWeight:700, flexShrink:0 }}>{confLbl.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:14, padding:"10px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <p style={{ margin:0, fontSize:11, color:"#64748b", lineHeight:1.6 }}>
                <strong style={{ color:"#374151" }}>ℹ️ Confidence:</strong> Based on how strongly your intelligence and personality traits align with each career's professional profile.
              </p>
            </div>
          </div>
        )}

        {/* ── Charts ── */}
        <div className="rp-charts" style={{ marginBottom:20 }}>
          <div style={{ background:"white", borderRadius:20, padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:16, margin:"0 0 4px" }}>Multiple Intelligences</h3>
            <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 12px" }}>Gardner's Theory</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={intelData}>
                <PolarGrid stroke="#f1f5f9"/>
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:"#64748b" }}/>
                <Radar dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.25} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"white", borderRadius:20, padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:16, margin:"0 0 4px" }}>RIASEC Personality</h3>
            <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 12px" }}>Holland's Occupational Themes</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riasecData} layout="vertical" margin={{ left:8, right:16 }}>
                <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fill:"#94a3b8" }}/>
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize:11, fill:"#64748b" }}/>
                <Tooltip formatter={(v:any) => [`${Number(v).toFixed(1)}%`,"Score"]}/>
                <Bar dataKey="score" radius={[0,8,8,0]}>
                  {riasecData.map((_,i) => <Cell key={i} fill={RIASEC_COLORS[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Intelligence Breakdown ── */}
        <div className="rp-section" style={{ background:"white", borderRadius:20, padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:16, margin:"0 0 4px" }}>Intelligence Score Breakdown</h3>
          <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 16px" }}>Sorted by strength — highest to lowest</p>
          <div className="rp-intel">
            {intelData.map((item, i) => {
              const status = getStatus(item.score);
              const color  = INTEL_COLORS[item.subject] || "#667eea";
              const icon   = INTEL_ICONS[item.subject]  || "⭐";
              return (
                <div key={item.subject} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:i===0?"#f8f7ff":"#f8fafc", borderRadius:12, border:i===0?"2px solid #667eea30":"2px solid transparent" }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:color+"20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, flexWrap:"wrap", gap:4 }}>
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
        <div className="rp-section" style={{ background:"white", borderRadius:20, padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:24 }}>
          <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:16, margin:"0 0 4px" }}>RIASEC Personality Profile</h3>
          <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 16px" }}>Holland's six personality types — sorted by dominance</p>
          <div className="rp-riasec">
            {riasecData.map((item, i) => {
              const info   = RIASEC_INFO[item.name] || { icon:"⭐", desc:"" };
              const status = getRiasecStatus(item.score);
              return (
                <div key={item.name} style={{ padding:"16px", borderRadius:14, background:i===0?"linear-gradient(135deg,#667eea08,#764ba208)":"#f8fafc", border:i===0?"2px solid #667eea30":"2px solid #f1f5f9" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:22 }}>{info.icon}</span>
                    <span style={{ background:status.bg, color:status.color, padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:700 }}>{status.label}</span>
                  </div>
                  <p style={{ fontWeight:700, color:"#1e293b", fontSize:14, margin:"0 0 3px" }}>{item.name}</p>
                  <p style={{ color:"#94a3b8", fontSize:11, margin:"0 0 10px" }}>{info.desc}</p>
                  <div style={{ height:7, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${item.score}%`, background:RIASEC_COLORS[i], borderRadius:4 }}/>
                  </div>
                  <p style={{ fontWeight:700, color:"#374151", fontSize:13, margin:"6px 0 0", textAlign:"right" }}>{item.score.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="rp-footer">
          <button className="rp-footer-btn" onClick={handlePDF} disabled={pdfLoad}
            style={{ borderRadius:12, background:"linear-gradient(135deg,#667eea,#764ba2)", color:"white", border:"none", fontWeight:700, cursor:pdfLoad?"not-allowed":"pointer", fontFamily:FF, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:pdfLoad?0.7:1 }}>
            {pdfLoad ? "Generating..." : "⬇ Download PDF Report"}
          </button>
          <button className="rp-footer-btn" onClick={() => router.push("/dashboard")}
            style={{ borderRadius:12, background:"white", color:"#374151", border:"2px solid #e2e8f0", fontWeight:700, cursor:"pointer", fontFamily:FF }}>← Back to Dashboard</button>
          <button className="rp-footer-btn" onClick={handleLogout}
            style={{ borderRadius:12, background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", fontWeight:700, cursor:"pointer", fontFamily:FF }}>Logout</button>
        </div>

      </div>
    </div>
  );
}