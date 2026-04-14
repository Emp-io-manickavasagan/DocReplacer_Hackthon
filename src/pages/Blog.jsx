import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Construction, Clock, Sparkles } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden flex flex-col items-center justify-center">
      {/* SEO & META TAGS */}
      <Helmet>
        <title>Blog | DocReplacer - AI Word Document Generator</title>
        <meta name="description" content="Stay updated with the latest AI document generation trends, tips, and DocReplacer updates." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .serif { font-family: 'DM Serif Display', serif; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        
        .floating { animation: float 6s ease-in-out infinite; }
        .pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }
      `}</style>

      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-4xl px-6 py-20 text-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-8 mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            Coming Soon to DocReplacer
          </div>
          
          <h1 className="serif text-[48px] md:text-[72px] text-white leading-tight mb-6">
            Our <span className="italic text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc)' }}>Blog</span> is almost here.
          </h1>
          
          <div className="relative inline-block mt-8 mb-12">
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden">
              {/* Construction Icon with Glow */}
              <div className="relative w-24 h-24 mx-auto mb-8 floating">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                <div className="relative flex items-center justify-center w-full h-full bg-indigo-600 rounded-3xl shadow-lg border border-indigo-400/30 text-white">
                  <Construction className="w-12 h-12" />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Not Currently Available
              </h2>
              
              <p className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
                We're currently crafting high-quality content about document generation, AI productivity, and enterprise workflows. Stay tuned for our official launch!
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-6">
                {[
                  { icon: <Clock className="w-4 h-4" />, label: "Target: Q3 2024" },
                  { icon: <Sparkles className="w-4 h-4" />, label: "AI Insights" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-bold uppercase tracking-widest">
                    <span className="text-indigo-400">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decorative elements around the card */}
            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-2xl" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/30 rounded-bl-2xl" />
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full p-8 flex justify-center border-t border-white/[0.03] mt-auto">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-6 h-6 rounded-lg bg-[#c7cbe8] flex items-center justify-center p-1 shadow-sm">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-full h-full object-contain" />
          </div>
          <span className="brand-font text-[14px] text-white/80">DocReplacer Blog</span>
        </div>
      </footer>
    </div>
  );
}
