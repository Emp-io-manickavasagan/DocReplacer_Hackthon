import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, ArrowRight, CheckCircle2, Briefcase, Zap, Lock, ChevronRight } from 'lucide-react';

export default function UseCasePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      <Helmet>
        <title>AI Business Proposal Generator | Free .docx Builder | DocReplacer</title>
        <meta name="description" content="Instantly generate professional, formatted business proposals in .docx format. 100% free, private, and runs entirely in your browser." />
        <meta name="keywords" content="AI business proposal generator, write business proposal AI, free docx proposal template, client-side document builder" />
        <link rel="canonical" href="https://docreplacer.com/generate/business-proposal" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .serif { font-family: 'DM Serif Display', serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
        .glow-btn { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); transition: all 0.3s; }
        .glow-btn:hover { box-shadow: 0 0 28px 4px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.4); transform: translateY(-1px); }
      `}</style>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter:'blur(60px)'}} />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-lg flex items-center justify-center bg-[#c7cbe8]">
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="brand-font text-[18px] text-white">DocReplacer</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[13px] font-semibold text-white/50 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/app" className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-[13px] transition-all glow-btn">
              Build Proposal Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-8">
            <Briefcase className="w-3.5 h-3.5" /> Specific Use Case
          </div>
          <h1 className="serif text-[48px] md:text-[64px] text-white leading-[1.05] tracking-tight mb-6">
            Write Winning <span className="italic text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(135deg, #818cf8, #a78bfa)'}}>Business Proposals</span> in Minutes.
          </h1>
          <p className="text-white/50 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop staring at a blank Word document. Enter your client's needs, and let our AI generate a fully-formatted, ready-to-download proposal instantly.
          </p>
          <Link to="/app" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-[16px] text-white glow-btn" style={{background:'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
            Generate Proposal for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features specific to use case */}
      <section className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Persuasive Structure', desc: 'Automatically outlines executive summaries, deliverables, and pricing tables.' },
            { title: 'Custom Formatting', desc: 'Adjust margins, fonts, and table styles to match your corporate brand identity.' },
            { title: 'Strictly Confidential', desc: 'Built entirely on the frontend. Your client data never touches a server.' }
          ].map(({ title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="font-bold text-[17px] text-white mb-2">{title}</h3>
              <p className="text-white/45 text-[14px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}