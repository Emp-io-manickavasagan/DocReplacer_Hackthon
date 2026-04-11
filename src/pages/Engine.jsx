import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Code, Cpu, Database, FileCog, ArrowRight, Terminal } from 'lucide-react';

export default function EnginePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      <Helmet>
        <title>Under the Hood | DocReplacer Architecture</title>
        <meta name="description" content="Discover how DocReplacer builds complex .docx files entirely in the browser using a frontend-only architecture and zero-retention AI endpoints." />
        <meta name="keywords" content="frontend architecture, client side docx generation, zero retention AI, browser OpenXML assembly" />
        <link rel="canonical" href="https://docreplacer.com/engine" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .serif { font-family: 'DM Serif Display', serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; }
      `}</style>

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
            <Link to="/app" className="text-[13px] font-semibold text-white/50 hover:text-white transition-colors">
              Open App
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8 grid-bg">
        <div className="max-w-3xl mx-auto">

          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-6">
              <Terminal className="w-3.5 h-3.5" /> Architecture Overview
            </div>
            <h1 className="serif text-[48px] md:text-[56px] text-white leading-tight mb-4">Under the Hood</h1>
            <p className="text-white/50 text-lg leading-relaxed">How we engineered a highly capable document generator without relying on server-side data storage.</p>
          </div>

          <div className="space-y-8">
            {/* Tech Stack Block 1 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-red-400" />
                <h2 className="text-[22px] font-bold text-white">Frontend-Only Architecture</h2>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                DocReplacer is built on a strict zero-database philosophy. We rely entirely on a frontend-only architecture to handle application logic, block-level state management, and file routing. By completely removing the backend server from the equation, we guarantee that no user session or document content is ever stored or cached.
              </p>
            </div>

            {/* Tech Stack Block 2 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-indigo-400" />
                <h2 className="text-[22px] font-bold text-white">Zero-Retention AI Processing</h2>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                Instead of routing your documents through standard cloud environments, DocReplacer connects directly to secure, enterprise-grade AI endpoints. We strictly utilize non-training API models. This ensures the AI processes your prompt and generates the structural JSON payload, but retains absolute zero memory of your proprietary data once the request is complete.
              </p>
            </div>

            {/* Tech Stack Block 3 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-4">
                <FileCog className="w-6 h-6 text-emerald-400" />
                <h2 className="text-[22px] font-bold text-white">In-Browser OpenXML Compilation</h2>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                The core of the engine activates after the text generation phase. Rather than sending text back to a remote server to be formatted, DocReplacer utilizes a custom client-side assembly engine. It dynamically converts the AI's JSON output into strictly compliant OpenXML (<code>word/document.xml</code>), applies your global styling configurations, and compresses the final <code>.docx</code> archive directly inside your browser's memory.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-white text-[18px] mb-2">Ready to test the engine?</h3>
              <p className="text-white/50 text-[14px]">Experience client-side document generation instantly.</p>
            </div>
            <Link to="/app" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black rounded-full font-bold text-[14px] transition-all">
              Launch Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}