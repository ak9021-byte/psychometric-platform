"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_name",  res.data.name  || "");
      localStorage.setItem("user_email", res.data.email || email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "🧠", title: "30 Smart Questions",      desc: "Covering 8 intelligence types + 6 RIASEC personality dimensions" },
    { icon: "📊", title: "Detailed Report & Charts", desc: "Radar charts, bar graphs, score breakdown with status badges" },
    { icon: "🎯", title: "Career Recommendations",   desc: "Personalized career path based on your unique psychometric profile" },
    { icon: "🔬", title: "Based on Science",         desc: "Howard Gardner's Multiple Intelligence + Holland's RIASEC theory" },
  ];

  const stats = [
    { value: "30",              label: "Total Questions" },
    { value: "Intelligence",    label: "Types Measured" },
    { value: "Personality",     label: "Traits Measured" },
    { value: "100%",            label: "Always Free" },
  ];

  return (
    <div className="psych-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .psych-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          background: #060612;
          overflow-x: hidden;
        }

        /* ── Animations ── */
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes orb1    { 0%,100%{ transform:translate(0,0) scale(1); } 33%{ transform:translate(40px,-30px) scale(1.1); } 66%{ transform:translate(-20px,20px) scale(0.95); } }
        @keyframes orb2    { 0%,100%{ transform:translate(0,0) scale(1); } 33%{ transform:translate(-30px,20px) scale(1.05); } 66%{ transform:translate(20px,-30px) scale(0.9); } }
        @keyframes orb3    { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(15px,-15px) scale(1.08); } }
        @keyframes shimmer { 0%{ background-position:200% center; } 100%{ background-position:-200% center; } }
        @keyframes gridMove{ 0%{ transform:translateY(0); } 100%{ transform:translateY(40px); } }
        @keyframes pulse   { 0%,100%{ opacity:0.6; } 50%{ opacity:1; } }
        @keyframes slideIn { from{ opacity:0; transform:translateX(20px); } to{ opacity:1; transform:translateX(0); } }
        @keyframes badgePop{ from{ opacity:0; transform:scale(0.8); } to{ opacity:1; transform:scale(1); } }

        /* ── Layout ── */
        .psych-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── Left Panel ── */
        .left-panel {
          position: relative;
          flex: 1;
          overflow: hidden;
          padding: 48px 28px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(155deg, #0a0820 0%, #120d35 40%, #0e1628 70%, #080614 100%);
        }

        /* Animated grid */
        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(102,126,234,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102,126,234,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 8s linear infinite;
          pointer-events: none;
        }

        /* Ambient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(60px);
        }
        .orb-1 { width:400px; height:400px; top:-100px; left:-120px; background:radial-gradient(circle, rgba(102,126,234,0.22), transparent 70%); animation: orb1 12s ease-in-out infinite; }
        .orb-2 { width:320px; height:320px; bottom:-80px; right:-60px; background:radial-gradient(circle, rgba(118,75,162,0.20), transparent 70%); animation: orb2 15s ease-in-out infinite; }
        .orb-3 { width:200px; height:200px; top:40%; right:10%; background:radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%); animation: orb3 10s ease-in-out infinite; }

        /* Floating particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: pulse 3s ease-in-out infinite;
        }
        .p1 { width:4px; height:4px; top:20%; left:15%; background:#667eea; opacity:0.5; animation-delay:0s; }
        .p2 { width:3px; height:3px; top:60%; left:8%; background:#a78bfa; opacity:0.4; animation-delay:1s; }
        .p3 { width:5px; height:5px; top:35%; right:18%; background:#10b981; opacity:0.35; animation-delay:2s; }
        .p4 { width:3px; height:3px; top:75%; right:25%; background:#667eea; opacity:0.45; animation-delay:0.5s; }
        .p5 { width:4px; height:4px; top:15%; right:35%; background:#f59e0b; opacity:0.3; animation-delay:1.5s; }

        /* Logo */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 44px;
          animation: fadeUp 0.6s ease both;
        }
        .logo-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          position: relative;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(102,126,234,0.3), 0 8px 32px rgba(102,126,234,0.3);
        }
        .logo-icon::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          pointer-events: none;
        }
        .logo-name { font-weight: 800; font-size: 18px; color: white; letter-spacing: 0.3px; }
        .logo-sub  { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px; }

        /* Headline */
        .headline-block { animation: fadeUp 0.7s ease 0.08s both; }
        .headline {
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 900;
          color: white;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }
        .headline-gradient {
          background: linear-gradient(90deg, #818cf8, #a78bfa 40%, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .subheadline {
          color: rgba(255,255,255,0.55);
          font-size: 15px;
          line-height: 1.75;
          max-width: 460px;
          margin-bottom: 36px;
        }

        /* Badge strip */
        .badge-strip {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 36px;
          animation: fadeUp 0.7s ease 0.16s both;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          animation: badgePop 0.5s ease both;
          white-space: nowrap;
        }
        .badge-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        /* Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 36px;
          animation: fadeUp 0.7s ease 0.22s both;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat-cell {
          background: rgba(255,255,255,0.04);
          padding: 16px 12px;
          text-align: center;
        }
        .stat-value { font-size: clamp(11px, 2vw, 22px); font-weight: 900; color: white; line-height: 1; }
        .stat-label { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; line-height: 1.3; }

        /* Feature cards */
        .features-list { display:flex; flex-direction:column; gap:10px; animation: fadeUp 0.7s ease 0.28s both; }
        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.25s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px 0 0 3px;
          background: linear-gradient(180deg, #667eea, #a78bfa);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .feature-card:hover { background: rgba(255,255,255,0.09); transform: translateX(6px); border-color: rgba(102,126,234,0.25); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(102,126,234,0.12);
          border: 1px solid rgba(102,126,234,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .feature-title { font-weight: 700; color: white; font-size: 13px; margin-bottom: 3px; }
        .feature-desc  { color: rgba(255,255,255,0.45); font-size: 12px; line-height: 1.5; }
        .credit { margin-top: 28px; color: rgba(255,255,255,0.2); font-size: 11px; animation: fadeUp 0.7s ease 0.34s both; }

        /* ── Right Panel ── */
        .right-panel {
          width: 100%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          position: relative;
        }
        .right-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #a78bfa, #34d399, #667eea);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .login-card { width: 100%; max-width: 100%; animation: fadeUp 0.6s ease 0.15s both; }

        /* Card header */
        .card-header { text-align: center; margin-bottom: 36px; }
        .brand-logo { height: 84px; object-fit: contain; margin: 0 auto 16px; display: block; }
        .card-title { font-size: 28px; font-weight: 800; color: #0f0a2e; letter-spacing: -0.3px; }
        .card-sub   { color: #94a3b8; font-size: 15px; margin-top: 6px; }

        /* Trust badge */
        .trust-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 10px 16px;
          background: #f8fafc;
          border-radius: 10px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }
        .trust-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#64748b; font-weight:600; }

        /* Error */
        .error-box { background:#fff0f0; border:1px solid #fca5a5; color:#dc2626; padding:12px 16px; border-radius:12px; margin-bottom:20px; font-size:13px; display:flex; align-items:center; gap:8px; }

        /* Fields */
        .field-group { margin-bottom: 20px; }
        .field-label { display:block; font-weight:700; color:#374151; margin-bottom:8px; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; }
        .field-wrap  { position: relative; }
        .field-icon  { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; color:#94a3b8; pointer-events:none; }
        .field-input {
          width: 100%;
          padding: 15px 16px 15px 48px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          font-size: 15px;
          outline: none;
          font-family: inherit;
          transition: all 0.2s ease;
          color: #1e293b;
          background: #fafafa;
        }
        .field-input:focus { border-color: #667eea; background: #fff; box-shadow: 0 0 0 4px rgba(102,126,234,0.1); }
        .field-input::placeholder { color: #cbd5e1; }
        .field-input-pr { padding-right: 48px; }

        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 16px; color: #94a3b8; padding: 0; line-height: 1;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #667eea; }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #5a67d8, #667eea, #764ba2);
          background-size: 200% auto;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(102,126,234,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) { background-position: right center; box-shadow: 0 8px 28px rgba(102,126,234,0.5); transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.4); border-top-color:white; border-radius:50%; animation:spin 0.8s linear infinite; }

        /* Divider */
        .divider { display:flex; align-items:center; gap:12px; margin:24px 0; }
        .div-line { flex:1; height:1px; background:#f1f5f9; }
        .div-text { color:#cbd5e1; font-size:11px; font-weight:700; letter-spacing:1px; }

        /* Register */
        .register-btn {
          width: 100%;
          padding: 14px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          text-align: center;
          color: #374151;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #f8fafc;
          text-decoration: none;
          display: block;
        }
        .register-btn:hover { border-color: #667eea; color: #667eea; background: rgba(102,126,234,0.04); }
        .register-btn span { color: #667eea; }

        .secure-note { text-align:center; color:#cbd5e1; font-size:11px; margin-top:20px; display:flex; align-items:center; justify-content:center; gap:5px; }

        /* ── Responsive ── */
        @media (min-width: 900px) {
          .psych-layout    { flex-direction: row; }
          .left-panel      { padding: 60px 64px; }
          .right-panel     { width: 500px; flex-shrink: 0; padding: 48px 52px; box-shadow: -2px 0 60px rgba(0,0,0,0.12); }
          .right-panel::before { top:0; bottom:0; left:0; right:auto; width:4px; height:auto; }
        }
        @media (min-width: 640px) {
          .left-panel { padding: 56px 48px; }
        }
      `}</style>

      <div className="psych-layout">

        {/* ═══ LEFT PANEL ═══ */}
        <div className="left-panel">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="particle p1" />
          <div className="particle p2" />
          <div className="particle p3" />
          <div className="particle p4" />
          <div className="particle p5" />

          {/* Logo */}
          <div className="logo-wrap">
            <div className="logo-icon">🧠</div>
            <div>
              <div className="logo-name">Psychometric</div>
              <div className="logo-sub">Assessment Platform</div>
            </div>
          </div>

          {/* Headline */}
          <div className="headline-block">
            <h1 className="headline">
              Discover Your<br/>
              <span className="headline-gradient">True Potential</span>
            </h1>
            <p className="subheadline">
              Take a scientifically designed psychometric assessment to uncover your intelligence strengths, personality type, and ideal career path.
            </p>
          </div>

          {/* Badge strip */}
          <div className="badge-strip">
            {[
              { dot:"#818cf8", text:"IQ Assessment" },
              { dot:"#34d399", text:"Career Mapping" },
              { dot:"#f59e0b", text:"RIASEC Model" },
              { dot:"#f472b6", text:"Free Forever" },
            ].map((b, i) => (
              <div className="badge" key={i} style={{ animationDelay:`${i*0.07}s` }}>
                <div className="badge-dot" style={{ background: b.dot }} />
                {b.text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-row">
            {stats.map(s => (
              <div className="stat-cell" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="features-list">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="credit">Based on Howard Gardner's MI Theory + Holland's RIASEC Model</p>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="right-panel">
          <div className="login-card">

            {/* Header */}
            <div className="card-header">
              <img src="/logo.png" alt="Knowletive" className="brand-logo" />
              <h2 className="card-title">Welcome Back</h2>
              <p className="card-sub">Sign in to continue your journey</p>
            </div>

            {/* Trust strip */}
            <div className="trust-strip">
              <div className="trust-item">🔐 SSL Encrypted</div>
              <div className="trust-item">🛡️ GDPR Safe</div>
              <div className="trust-item">✅ 100% Free</div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-box">⚠️ {error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉️</span>
                  <input
                    type="email" value={email} required
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="field-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group" style={{ marginBottom: 28 }}>
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">🔒</span>
                  <input
                    type={showPass ? "text" : "password"} value={password} required
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="field-input field-input-pr"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <><div className="spinner" /> Signing in...</>
                ) : <>Sign In <span style={{ fontSize:18 }}>→</span></>}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <div className="div-line" />
              <span className="div-text">NEW HERE?</span>
              <div className="div-line" />
            </div>

            {/* Register */}
            <Link href="/register" className="register-btn">
              Create an Account — <span>It's Free</span>
            </Link>

            {/* Secure note */}
            <div className="secure-note">🔐 Secure &amp; confidential — your data is protected</div>
          </div>
        </div>
      </div>
    </div>
  );
}