"use client";
import { useEffect, useState } from "react";
import { getAllStudents, getAnalytics } from "@/lib/api";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#667eea","#764ba2","#10b981","#f59e0b","#ef4444","#06b6d4","#8b5cf6"];

export default function AdminPage() {
  const [students,  setStudents]  = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/"); return; }
    Promise.all([getAllStudents(), getAnalytics()])
      .then(([s,a]) => { setStudents(s.data); setAnalytics(a.data); })
      .catch(() => setError("Access denied. Admin only."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ width:56, height:56, border:"4px solid #667eea", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ background:"white", borderRadius:20, padding:40, textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"#dc2626", margin:"0 0 8px" }}>Access Denied</h2>
        <p style={{ color:"#888", marginBottom:20 }}>{error}</p>
        <button onClick={() => router.push("/")} style={{ padding:"10px 24px", background:"#667eea", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600 }}>Go to Login</button>
      </div>
    </div>
  );

  const avgData = analytics?.avg_scores
    ? Object.entries(analytics.avg_scores).map(([k,v]) => ({
        name: k.replace(/_/g," ").split(" ").map((w:string) => w[0].toUpperCase()+w.slice(1)).join(" "),
        score: Number((v as number).toFixed(1))
      }))
    : [];

  const stats = [
    { label:"Total Students",  value: analytics?.total_students  ?? 0, icon:"👨‍🎓", color:"#667eea" },
    { label:"Tests Completed",  value: analytics?.total_completed ?? 0, icon:"✅",   color:"#10b981" },
    { label:"Pending Tests",    value: (analytics?.total_students??0)-(analytics?.total_completed??0), icon:"⏳", color:"#f59e0b" },
    { label:"Completion Rate",  value: analytics?.total_students ? `${Math.round((analytics.total_completed/analytics.total_students)*100)}%` : "0%", icon:"📊", color:"#764ba2" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Navbar */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>⚙️</span>
          <span style={{ fontWeight:700, fontSize:18, color:"#1a1a2e" }}>Admin Dashboard</span>
        </div>
        <button onClick={() => { localStorage.removeItem("token"); router.push("/"); }} style={{ padding:"10px 16px", background:"white", color:"#64748b", border:"2px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 20px" }}>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background:"white", borderRadius:16, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", borderTop:`4px solid ${s.color}` }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:"#1e293b", marginBottom:4 }}>{s.value}</div>
              <div style={{ color:"#94a3b8", fontSize:13, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Avg scores chart */}
        {avgData.length > 0 && (
          <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", marginBottom:24 }}>
            <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 4px" }}>Average Scores Across All Students</h3>
            <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 20px" }}>Intelligence type averages</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={avgData} margin={{ bottom:40 }}>
                <XAxis dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} angle={-25} textAnchor="end" interval={0}/>
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:"#94a3b8" }}/>
                <Tooltip formatter={(v:number) => [`${v}%`,"Avg"]}/>
                <Bar dataKey="score" radius={[8,8,0,0]}>
                  {avgData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Students table */}
        <div style={{ background:"white", borderRadius:20, padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontWeight:700, color:"#1e293b", fontSize:17, margin:"0 0 20px" }}>
            Registered Students ({students.length})
          </h3>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["#","Name","Email","School","Class","Registered"].map((h) => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:"#64748b", fontWeight:700, fontSize:12, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", color:"#94a3b8" }}>No students yet.</td></tr>
                ) : students.map((s,i) => (
                  <tr key={s.id} style={{ borderTop:"1px solid #f1f5f9" }}>
                    <td style={{ padding:"14px 16px", color:"#cbd5e1", fontWeight:600 }}>{i+1}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:14 }}>
                          {s.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, color:"#1e293b" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"14px 16px", color:"#64748b" }}>{s.email}</td>
                    <td style={{ padding:"14px 16px", color:"#64748b" }}>{s.school||"—"}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ background:"#ede9fe", color:"#7c3aed", padding:"3px 10px", borderRadius:20, fontWeight:700, fontSize:12 }}>{s.student_class||"—"}</span>
                    </td>
                    <td style={{ padding:"14px 16px", color:"#94a3b8", fontSize:13 }}>
                      {new Date(s.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}