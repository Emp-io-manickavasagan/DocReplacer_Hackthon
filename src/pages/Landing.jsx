import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HackathonLanding() {
  const [typed, setTyped] = useState('');
  const [showDoc, setShowDoc] = useState(false);
  const prompt = 'Write a project proposal for a mobile app startup...';

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) { clearInterval(iv); setTimeout(() => setShowDoc(true), 300); }
    }, 48);
    return () => clearInterval(iv);
  }, []);

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M10 6v4l2.5 2" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accent: '#818cf8',
      bg: 'rgba(99,102,241,0.08)',
      border: 'rgba(99,102,241,0.2)',
      title: 'Zero Server Architecture',
      blurb: 'Every byte — generation, XML assembly, export — runs as client-side JS. No backend, no latency, no breach surface.',
      tag: 'WebWorker + OpenXML',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="4" y="3" width="12" height="14" rx="2" stroke="#a78bfa" strokeWidth="1.5" />
          <path d="M7 7h6M7 10h5M7 13h3" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      accent: '#a78bfa',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      title: 'Real .docx — Not PDF',
      blurb: 'Genuine OpenXML Word files with headings, tables, lists. Opens in Word, Google Docs, LibreOffice — fully editable.',
      tag: 'OpenXML Compliant',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 10c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 6v4l2.5 1.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      accent: '#60a5fa',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)',
      title: 'Streaming Generation',
      blurb: 'Watch document sections appear in real time. No waiting for the full response — sections stream as they\'re written.',
      tag: 'Live Output',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="#34d399" strokeWidth="1.5" />
          <path d="M7 8h6M7 11h4" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 13l1.5 1.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      accent: '#34d399',
      bg: 'rgba(52,211,153,0.08)',
      border: 'rgba(52,211,153,0.2)',
      title: 'Block-Level Editing',
      blurb: 'Every paragraph, table, heading is an individually editable block. Rearrange, tweak, adjust before final export.',
      tag: 'Full Structure Control',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3L4 6v4.5c0 3.8 2.7 7 6 7.5 3.3-.5 6-3.7 6-7.5V6L10 3z" stroke="#f472b6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 10l2 2 3-3" stroke="#f472b6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      accent: '#f472b6',
      bg: 'rgba(244,114,182,0.08)',
      border: 'rgba(244,114,182,0.2)',
      title: 'Private by Design',
      blurb: 'No telemetry, no logs, no user data anywhere. Your prompts are ephemeral — gone when you close the tab.',
      tag: 'No Tracking · No Logs',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#fbbf24" strokeWidth="1.5" />
          <path d="M7.5 10l2 2 3-3" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      accent: '#fbbf24',
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.2)',
      title: 'Completely Free',
      blurb: 'No freemium tiers, no export limits, no watermarks. No sign-up. Open and generate as many documents as you want.',
      tag: 'Free Forever',
    },
  ];

  const steps = [
    { n: '01', label: 'Type a prompt', sub: 'Describe your document in plain English' },
    { n: '02', label: 'Review blocks', sub: 'Edit each section before export' },
    { n: '03', label: 'Download .docx', sub: 'One click — assembled in your browser' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: 'white', overflowX: 'hidden', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes docLine { from { width:0; opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes glow-pulse { 0%,100%{ box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50%{ box-shadow: 0 0 36px rgba(99,102,241,0.55); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        .f1 { animation: fadeUp 0.5s 0.05s both; }
        .f2 { animation: fadeUp 0.5s 0.15s both; }
        .f3 { animation: fadeUp 0.5s 0.28s both; }
        .f4 { animation: fadeUp 0.5s 0.4s both; }
        .f5 { animation: fadeUp 0.5s 0.52s both; }

        .cursor::after { content:'|'; animation: blink 0.9s step-end infinite; color:#818cf8; }
        .float-anim { animation: float 5s ease-in-out infinite; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 999px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          font-size: 14px; font-weight: 700; color: white;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.25s; animation: glow-pulse 2.5s ease infinite;
        }
        .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 22px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5);
          text-decoration: none; cursor: pointer; transition: all 0.25s; background: transparent;
        }
        .btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.25); }
        .feat-card {
          padding: 22px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.22s;
        }
        .feat-card:hover { border-color: rgba(99,102,241,0.25); transform: translateY(-2px); background: rgba(255,255,255,0.035); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 4px; }

        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .steps-row { flex-direction: column !important; }
          .steps-arrow { display: none !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a, .hero-btns button { text-align: center; justify-content: center; }
        }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 65%)', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '45%', height: '45%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.022 }}>
          <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="7" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            <rect x="6" y="7" width="14" height="2" rx="1" fill="#818cf8" />
            <rect x="6" y="12" width="10" height="2" rx="1" fill="#818cf8" opacity=".6" />
            <rect x="6" y="17" width="12" height="2" rx="1" fill="#818cf8" opacity=".35" />
          </svg>
          <span className="syne" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>DocReplacer</span>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['Features', '#features'], ['How it works', '#how']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}>{l}</a>
          ))}
        </div>

        <Link to="/app" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13, animation: 'none', boxShadow: '0 0 18px rgba(99,102,241,0.3)' }}>
          Launch Now
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '60px 24px 48px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>

        {/* Hackathon badge */}
        {/* <div className="f1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.07)', marginBottom: 24 }}>
          <span style={{ fontSize: 12 }}>🏆</span>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(251,191,36,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>Hackathon Submission 2025</span>
        </div> 
        */
        }

        <h1 className="syne f2" style={{ fontSize: 'clamp(36px,7vw,76px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 22 }}>
          Prompt to{' '}
          <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>.docx</span>
          <br />in your browser
        </h1>

        <p className="f3" style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px', fontWeight: 300 }}>
          Type a prompt. Get a fully-formatted Word document. No server, no login, no cloud — everything builds locally in your browser.
        </p>

        <div className="f4 hero-btns" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48, flexWrap: 'wrap' }}>
          <Link to="/app" className="btn-primary">
            Launch Now
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10M7 2.5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <a href="#features" className="btn-ghost">See features</a>
        </div>

        {/* Trust pills */}
        <div className="f5" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20 }}>
          {[
            { icon: '🔒', label: 'No Server' },
            { icon: '⚡', label: 'Instant Build' },
            { icon: '🆓', label: 'Free Forever' },
            { icon: '🕵️', label: '100% Private' },
            { icon: '📄', label: 'Real .docx' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              <span style={{ fontSize: 13 }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo window ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }} className="float-anim">
          <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)', overflow: 'hidden', boxShadow: '0 32px 72px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            {/* Browser bar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', gap: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['rgba(239,68,68,0.55)', 'rgba(234,179,8,0.55)', 'rgba(34,197,94,0.45)'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div className="mono" style={{ margin: '0 auto', fontSize: 10, color: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', padding: '3px 32px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                docreplacer.online — 100% client-side
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'rgba(74,222,128,0.7)', fontWeight: 600, letterSpacing: '0.06em' }} className="mono">
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
                LOCAL
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 340 }}>
              {/* Left – prompt */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: 18, background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' }} className="mono">Your Prompt</span>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 9, border: '1px solid rgba(99,102,241,0.2)', padding: 11, flex: 1 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }} className="cursor">{typed}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Heading style', 'Page count', 'Language'].map(opt => (
                    <div key={opt} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{opt}</span>
                      <span style={{ fontSize: 9, color: 'rgba(99,102,241,0.6)' }} className="mono">auto</span>
                    </div>
                  ))}
                </div>
                <Link to="/app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 11, fontWeight: 700, color: 'white', textDecoration: 'none' }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                  Generate .docx
                </Link>
              </div>

              {/* Right – preview */}
              <div style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', animation: 'float 3s ease-in-out infinite', pointerEvents: 'none', zIndex: 5 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' }} className="mono">Live Preview</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(129,140,248,0.7)' }} className="mono">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8', display: 'inline-block', animation: 'blink 1s step-end infinite' }} />
                    Building...
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {showDoc && <>
                    <div style={{ height: 13, width: '55%', borderRadius: 4, background: 'rgba(129,140,248,0.5)', animation: 'slideIn 0.4s both' }} />
                    <div style={{ height: 7, width: '35%', borderRadius: 3, background: 'rgba(255,255,255,0.15)', animation: 'slideIn 0.4s 0.08s both' }} />
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '3px 0' }} />
                    {[0.8, 0.9, 0.7, 0.85, 0.6].map((w, i) => (
                      <div key={i} style={{ height: 6, width: `${w * 100}%`, borderRadius: 3, background: 'rgba(255,255,255,0.1)', animation: `slideIn 0.35s ${0.15 + i * 0.07}s both` }} />
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '3px 0', animation: 'slideIn 0.3s 0.6s both' }} />
                    <div style={{ height: 9, width: '40%', borderRadius: 4, background: 'rgba(167,139,250,0.35)', animation: 'slideIn 0.35s 0.65s both' }} />
                    {[0.75, 0.85, 0.65].map((w, i) => (
                      <div key={i + 10} style={{ height: 6, width: `${w * 100}%`, borderRadius: 3, background: 'rgba(255,255,255,0.08)', animation: `slideIn 0.35s ${0.72 + i * 0.07}s both` }} />
                    ))}
                  </>}
                  {!showDoc && <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }} className="mono">Waiting for prompt...</div>}
                </div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, fontWeight: 600, color: 'rgba(129,140,248,0.9)' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v8M3 7l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Export .docx
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ position: 'relative', zIndex: 10, padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="syne" style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 48 }}>
            Three steps.{' '}
            <span style={{ color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>One .docx file.</span>
          </h2>

          <div className="steps-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {steps.map(({ n, label, sub }, i) => (
              <React.Fragment key={n}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 500, color: 'rgba(129,140,248,0.6)' }}>{n}</span>
                  </div>
                  <div>
                    <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 300, lineHeight: 1.6 }}>{sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="steps-arrow" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18, flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 className="syne" style={{ fontSize: 'clamp(22px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Everything in your browser.{' '}
              <span style={{ color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>Nothing leaves.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.33)', fontSize: 15, maxWidth: 440, margin: '0 auto', fontWeight: 300 }}>No account. No upload. No cloud. Your data never leaves your machine.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
            {features.map(({ icon, accent, bg, border, title, blurb, tag }) => (
              <div key={title} className="feat-card">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {icon}
                </div>
                <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: 14, fontWeight: 300 }}>{blurb}</p>
                <span className="mono" style={{ fontSize: 9, color: accent, background: `${bg}`, border: `1px solid ${border}`, padding: '3px 9px', borderRadius: 5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech highlight (hackathon-specific) ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ borderRadius: 18, padding: '40px 36px', border: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.12), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', marginBottom: 20 }}>
                <span className="mono" style={{ fontSize: 9, color: 'rgba(129,140,248,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>⚙ Under the Hood</span>
              </div>
              <h2 className="syne" style={{ fontSize: 'clamp(18px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', marginBottom: 24 }}>
                Built entirely client-side
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[
                  { label: 'Runtime', val: 'Browser / Vanilla JS', color: '#818cf8' },
                  { label: 'Document Engine', val: 'docx.js (OpenXML)', color: '#a78bfa' },
                  { label: 'Storage', val: 'localStorage only', color: '#60a5fa' },
                  { label: 'Backend', val: 'None — zero servers', color: '#34d399' },
                  { label: 'Auth', val: 'None — no sign-up', color: '#f472b6' },
                  { label: 'Data sent', val: 'Nothing leaves browser', color: '#fbbf24' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }} className="mono">{label}</div>
                    <div style={{ fontSize: 13, color, fontWeight: 600 }} className="mono">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '64px 24px 96px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            <span className="mono" style={{ fontSize: 9, color: 'rgba(129,140,248,0.8)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>Live · No Sign-up Needed</span>
          </div>
          <h2 className="syne" style={{ fontSize: 'clamp(24px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', marginBottom: 14, lineHeight: 1.1 }}>
            Build your first document<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>right now.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, marginBottom: 32, fontWeight: 300 }}>
            Free forever. Zero setup. Your browser is the server.
          </p>
          <Link to="/app" className="btn-primary" style={{ fontSize: 15, padding: '14px 36px' }}>
            Launch Now
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="7" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            <rect x="6" y="7" width="14" height="2" rx="1" fill="#818cf8" />
            <rect x="6" y="12" width="10" height="2" rx="1" fill="#818cf8" opacity=".6" />
            <rect x="6" y="17" width="12" height="2" rx="1" fill="#818cf8" opacity=".35" />
          </svg>
          <span className="syne" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>DocReplacer</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>100% client-side · No server · Free forever</span>
      </footer>
    </div>
  );
}