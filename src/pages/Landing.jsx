import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, Lock, Clock, FileText, CheckCircle2, Zap, Shield, Layers, ChevronRight, Star, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">

      {/* --- SEO & META TAGS HEAD INJECTION --- */}
      <Helmet>
        <title>DocReplacer | Free AI Word Document Generator & .docx Builder</title>
        <meta name="description" content="Generate professional Microsoft Word (.docx) files instantly from text prompts. A 100% free, private, client-side AI document creator with no login required." />
        <meta name="keywords" content="Free AI Word document generator, client-side docx creator, generate docx from prompt, private AI document writer, OpenXML builder, no login word doc" />
        <link rel="canonical" href="https://docreplacer.online/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docreplacer.online/" />
        <meta property="og:title" content="DocReplacer | Private AI .docx Generator" />
        <meta property="og:description" content="Turn a simple prompt into a fully-formatted .docx Word file securely in your browser. No server, no tracking." />
        <meta property="og:image" content="https://docreplacer.online/Logo.ico" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://docreplacer.online/" />
        <meta property="twitter:title" content="DocReplacer | Private AI .docx Generator" />
        <meta property="twitter:description" content="Turn a simple prompt into a fully-formatted .docx Word file securely in your browser. No server, no tracking." />
        <meta property="twitter:image" content="https://docreplacer.online/Logo.ico" />
      </Helmet>

      {/* AEO: SoftwareApplication Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "DocReplacer",
          "operatingSystem": "Web",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "Free AI-powered tool that generates professional .docx files from text prompts privately, entirely in the browser.",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "100"
          }
        })}
      </script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .serif { font-family: 'DM Serif Display', serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }
        .glow-btn { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); transition: all 0.3s; }
        .glow-btn:hover { box-shadow: 0 0 28px 4px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.4); transform: translateY(-1px); }
        .card-hover { transition: all 0.3s; border: 1px solid rgba(255,255,255,0.06); }
        .card-hover:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .floating { animation: float 4s ease-in-out infinite; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; }

        /* Custom Scrollbar scoped to landing page styles */
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 5px; border: 2px solid #0a0a0f; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.8); }
        * { scrollbar-width: thin; scrollbar-color: rgba(99, 102, 241, 0.5) #0a0a0f; }
      `}</style>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-[20%] right-[-15%] w-[50%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-lg flex items-center justify-center" style={{ background: '#c7cbe8' }}>
              <img src="/Logo.ico" alt="DocReplacer AI Word Generator Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="brand-font text-[18px] text-white">DocReplacer</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', href: '#' },
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '/how-it-works' },
              // { label: 'Engine', href: '/engine' },
              { label: 'Use Cases', href: '/use-cases' },
              { label: 'Docs', href: '/docs' },
              { label: 'Blog', href: '/blog' },
            ].map(({ label, href }) => (
              href.startsWith('/') ? (
                <Link key={label} to={href} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">{label}</Link>
              ) : (
                <a key={label} href={href} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">{label}</a>
              )
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app" className="hidden lg:inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-[13px] transition-all glow-btn">
              Get DocReplacer — It's Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors z-[60]"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-[55] bg-[#0a0a0f] backdrop-blur-2xl transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
            {[
              { label: 'Home', href: '#' },
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '/how-it-works' },
              //{ label: 'Engine', href: '/engine' },
              { label: 'Use Cases', href: '/use-cases' },
              { label: 'Docs', href: '/docs' },
              { label: 'Blog', href: '/blog' },
            ].map(({ label, href }, i) => (
              <div
                key={label}
                className={`transition-all duration-500 delay-[${i * 50}ms] ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              >
                {href.startsWith('/') ? (
                  <Link
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[24px] font-bold text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[24px] font-bold text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                )}
              </div>
            ))}
            <Link
              to="/app"
              onClick={() => setMenuOpen(false)}
              className="mt-4 inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-[16px] transition-all glow-btn"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 md:pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Guiding pill */}
          <div className="flex justify-center mb-8 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Private AI document builder — fast, secure, and ready to download
            </div>
          </div>

          <h1 className="serif text-[28px] sm:text-[42px] md:text-[64px] text-white leading-[1.2] md:leading-[1.05] tracking-tight mb-6 fade-up-1 px-4 text-center">
            Write Professional<br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text pr-2 md:pr-4 mx-2 md:mx-0" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)' }}>Documents</span><br className="hidden md:block" />
            made simple.
          </h1>

          <p className="text-center text-white/50 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium fade-up-2">
            Turn a simple text prompt into a fully-formatted <span className="text-white/80">.docx Word file</span> — your free, client-side AI document creator.
          </p>

          {/* 3-step guide strip */}
          <div className="flex justify-center mb-10 fade-up-2">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
              {['Describe your doc', 'Review & edit blocks', 'Download .docx'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-semibold text-white/50">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                    <span className="whitespace-nowrap">{step}</span>
                  </div>
                  {i < 2 && <ChevronRight className="hidden sm:block w-3 h-3 text-white/20 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-up-3">
            <Link to="/app" className="group flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-[15px] text-white glow-btn" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Get Started for Free
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link to="/how-it-works" className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all bg-white/[0.03]">
              Learn how
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-20 fade-up-4">
            {[
              { icon: <Clock className="w-3.5 h-3.5" />, label: '7-MIN SETUP' },
              { icon: <Lock className="w-3.5 h-3.5" />, label: 'CLIENT SIDE BUILDING' },
              { icon: <FileText className="w-3.5 h-3.5" />, label: 'OPENXML COMPLIANT' },
              { icon: <Star className="w-3.5 h-3.5" />, label: 'COMPLETELY FREE' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'NO LOGIN REQUIRED' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] font-bold text-white/30 tracking-[0.12em] uppercase">
                <span className="text-indigo-500">{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>

        {/* App preview graphic */}
        <div className="max-w-5xl mx-auto fade-up-4">
          <div className="relative rounded-[20px] overflow-hidden border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            {/* Window chrome */}
            <div className="flex items-center px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="mx-auto mono text-[11px] text-white/25 bg-white/[0.04] px-14 py-1 rounded-md border border-white/[0.07]">docreplacer.local</div>
              <div className="w-16" />
            </div>

            <div className="grid-bg flex h-[320px] md:h-[440px]">
              {/* Sidebar */}
              <div className="w-60 shrink-0 border-r border-white/[0.06] p-5 hidden md:flex flex-col gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#c7cbe8' }}>
                    <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="brand-font text-[14px] text-white">DocReplacer</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Menu</div>
                  {[
                    { icon: <FileText className="w-4 h-4" />, label: 'Documents', active: true },
                  ].map(({ icon, label, active }) => (
                    <div key={label} className={`flex items-center gap-3 text-[13px] font-semibold px-3 py-2.5 rounded-xl ${active ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/30'}`}>
                      <span className={active ? 'text-indigo-400' : ''}>{icon}</span> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start overflow-hidden relative">
                <div className="w-full max-w-[280px] md:max-w-sm floating">
                  <div className="bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[13px] text-white">Business Proposal</div>
                      <div className="text-[11px] text-white/40">Trigger</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex justify-center mb-5">
                    <div className="w-px h-8 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 flex items-center gap-3 mb-5 ml-8">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-[12px] text-white/80">Generate Structure</div>
                      <div className="text-[10px] text-white/30 mono">AI Processing</div>
                    </div>
                  </div>
                  <div className="flex justify-center mb-5">
                    <div className="w-px h-6 bg-white/[0.08]" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="text-[11px] font-semibold text-white/70">Add Sections</div>
                    </div>
                    <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="text-[11px] font-semibold text-white/70">Export .docx</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ background: 'linear-gradient(to top, #0a0a0f, transparent)' }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-[12px] font-semibold tracking-wide mb-5">✦ Why DocReplacer</div>
            <h2 className="serif text-[42px] md:text-[56px] text-white leading-tight mb-4">Everything you need to<br /><span className="italic text-white/50">ship documents faster</span></h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Prompt once, get a fully-formatted, ready-to-share Word document in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Zap className="w-5 h-5 text-indigo-400" />,
                bg: 'rgba(99,102,241,0.1)',
                border: 'rgba(99,102,241,0.2)',
                title: 'Streaming AI Generation',
                desc: 'Watch your document come alive in real time. Sections appear as the AI writes — no waiting for a full response.',
                tip: '💡 Use the page selector to control document length and density.',
              },
              {
                icon: <Lock className="w-5 h-5 text-violet-400" />,
                bg: 'rgba(139,92,246,0.1)',
                border: 'rgba(139,92,246,0.2)',
                title: 'Private Client-Side Build',
                desc: 'Everything runs directly in your browser — your private data never leaves your device, making it perfect for confidential content.',
                tip: '💡 Your data stays in your browser — nothing is stored or sent to a DB.',
              },
              {
                icon: <Layers className="w-5 h-5 text-blue-400" />,
                bg: 'rgba(59,130,246,0.1)',
                border: 'rgba(59,130,246,0.2)',
                title: 'OpenXML .docx Control',
                desc: 'Edit every block — paragraphs, tables, bullets, columns. Fine-tune fonts, spacing, and margins before native Word export.',
                tip: '💡 Use the Style Editor in the Review step to match your brand.',
              },
            ].map(({ icon, bg, border, title, desc, tip }) => (
              <div key={title} className="card-hover rounded-2xl p-6 bg-white/[0.03]">
                <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
                  {icon}
                </div>
                <h3 className="font-bold text-[17px] text-white mb-2">{title}</h3>
                <p className="text-white/45 text-[14px] leading-relaxed mb-4">{desc}</p>
                <div className="text-[12px] text-indigo-300/70 bg-indigo-500/10 rounded-xl px-3 py-2.5 border border-indigo-500/15 font-medium">{tip}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Preview */}
      <section className="relative z-10 py-20 px-6 lg:px-8 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="serif text-[32px] md:text-[42px] text-white mb-6">Built for <span className="italic text-white/50">Simplicity</span></h2>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto font-medium">DocReplacer transforms your prompts into structured .docx files in three simple steps. No account tracking, no setup, just your local browser doing the work.</p>

          <Link to="/how-it-works" className="inline-flex items-center gap-2 group px-6 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.04] text-white font-semibold transition-all">
            See the full breakdown <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-[28px] p-8 md:p-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2), transparent 70%)' }} />
            <div className="relative">
              <h2 className="serif text-[32px] md:text-[52px] text-white leading-tight mb-4">Start generating free<br /><span className="italic text-white/60">AI Word documents today</span></h2>
              <p className="text-white/50 text-lg mb-8 font-medium">Free forever. No account needed. Just open DocReplacer and go.</p>
              <Link to="/app" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-[16px] text-white glow-btn" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                Open DocReplacer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Submit AI Tools Badge */}
      <div className="relative z-10 flex justify-center pb-16">
        <a href="https://submitaitools.org" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://submitaitools.org/static_submitaitools/images/submitaitools.png" 
            alt="Submit AI Tools" 
            style={{ borderRadius: '10px', width: '200px', height: '60px' }} 
          />
        </a>
      </div>

    </div>
  );
}