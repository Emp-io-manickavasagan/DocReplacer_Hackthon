import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Cpu, ArrowRight, CheckCircle2, Zap, FileText, ChevronRight, Menu, X, HelpCircle } from 'lucide-react';

export default function HowItWorksPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const steps = [
    {
      step: '01', title: 'Describe your document prompt',
      desc: 'Type a prompt like "Technical report on renewable energy". Choose document type, length (1–10 pages), and let the AI generator start.',
      guide: 'Be specific — mentioning the audience, tone, and purpose gives the AI much better context.',
    },
    {
      step: '02', title: 'Review and refine each block',
      desc: 'Your document streams in section by section. Edit any block manually or ask the AI to rewrite, expand, or format specific parts.',
      guide: 'Use the "✦ AI" button on each block to give targeted instructions like "make this more formal" or "add 2 rows to this table".',
    },
    {
      step: '03', title: 'Build and download your .docx',
      desc: 'Adjust global styles — fonts, spacing, margins — then hit Build. Get a perfectly formatted Word file in seconds directly to your local machine.',
      guide: 'The Style Editor in the left panel lets you set brand fonts and colors so every document looks consistent.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      <Helmet>
        <title>How it Works | DocReplacer AI Document Generation Process</title>
        <meta name="description" content="Learn how DocReplacer uses AI to generate professional .docx files in 3 easy steps. Secure, private, and 100% browser-based document creation." />
        <meta name="keywords" content="AI document generation, how DocReplacer works, prompt to word, browser-based docx builder, private document AI" />
        <link rel="canonical" href="https://docreplacer.com/how-it-works" />
        
        {/* Social Meta Tags */}
        <meta property="og:title" content="How it Works | DocReplacer AI Process" />
        <meta property="og:description" content="3 steps to your perfect AI-generated document. Private, browser-based, and fast." />
        <meta property="og:url" content="https://docreplacer.com/how-it-works" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* HowTo Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to generate a Word document with DocReplacer",
          "step": steps.map((s, i) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "name": s.title,
            "itemListElement": [{
              "@type": "HowToDirection",
              "text": s.desc
            }]
          }))
        })}
      </script>

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
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full" style={{background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter:'blur(60px)'}} />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-lg flex items-center justify-center" style={{background:'#c7cbe8'}}>
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="brand-font text-[18px] text-white">DocReplacer</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-[13px] font-semibold text-white/50 hover:text-white transition-colors">Home</Link>
              <Link to="/app" className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-[13px] transition-all glow-btn">
                Launch App <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/70 hover:text-white transition-colors z-[60]">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-[55] bg-[#0a0a0f]/95 backdrop-blur-2xl transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-[24px] font-bold text-white/70 hover:text-white">Home</Link>
            <Link to="/app" onClick={() => setMenuOpen(false)} className="text-[24px] font-bold text-white/70 hover:text-white">App</Link>
            <Link to="/engine" onClick={() => setMenuOpen(false)} className="text-[24px] font-bold text-white/70 hover:text-white">Engine</Link>
            <Link to="/use-cases" onClick={() => setMenuOpen(false)} className="text-[24px] font-bold text-white/70 hover:text-white">Use Cases</Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 pt-40 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-8">
              <HelpCircle className="w-3.5 h-3.5" /> Step-by-Step Guide
            </div>
            <h1 className="serif text-[36px] sm:text-[48px] md:text-[64px] text-white leading-tight mb-6">
              Three steps to your <span className="italic text-transparent bg-clip-text pr-2 md:pr-4" style={{backgroundImage:'linear-gradient(135deg, #818cf8, #a78bfa)'}}>perfect document</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              We've engineered DocReplacer to be as simple as possible. No account needed, no learning curve. Just prompt and download.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map(({ step, title, desc, guide }) => (
              <div key={step} className="card-hover rounded-2xl p-8 bg-white/[0.025] flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                   <FileText className="w-24 h-24" />
                </div>
                <div className="mono text-[40px] font-bold text-indigo-500/20 shrink-0 leading-none">{step}</div>
                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-[22px] text-white mb-4">{title}</h3>
                  <p className="text-white/45 text-[16px] leading-relaxed mb-6">{desc}</p>
                  <div className="flex items-start gap-3 text-[14px] text-indigo-300/80 font-medium bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{guide}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/app" className="inline-flex items-center gap-2.5 px-10 py-5 rounded-full font-bold text-[18px] text-white glow-btn" style={{background:'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
              Try it Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
