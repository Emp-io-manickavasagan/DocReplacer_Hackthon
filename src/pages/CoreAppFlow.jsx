import React, { useState, useEffect } from 'react';
import { DEFAULT_DOC_STYLES } from '../utils/constants.js';
import Step1Prompt from '../components/CoreAppFlow/Step1Prompt.jsx';
import Step2Editor from '../components/CoreAppFlow/Step2Editor.jsx';
import Step3Result from '../components/CoreAppFlow/Step3Result.jsx';
import Stepper from '../components/CoreAppFlow/Stepper.jsx';
import LoadingOverlay from '../components/CoreAppFlow/LoadingOverlay.jsx';

export default function CoreAppFlow() {
  const [step, setStep] = useState(0);
  const [elements, setElements] = useState([]);
  const [targetPages, setTargetPages] = useState(3);
  const [result, setResult] = useState(null);
  const [docStyles, setDocStyles] = useState({
    title: { ...DEFAULT_DOC_STYLES.title },
    h1: { ...DEFAULT_DOC_STYLES.h1 },
    h2: { ...DEFAULT_DOC_STYLES.h2 },
    paragraph: { ...DEFAULT_DOC_STYLES.paragraph },
    table: { ...DEFAULT_DOC_STYLES.table },
    bullets: { ...DEFAULT_DOC_STYLES.bullets },
    pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins },
  });
  const [loadingPhase, setLoadingPhase] = useState(null);



  useEffect(() => {
    if (!window.JSZip) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.integrity = "sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==";
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    const st = document.createElement("style");
    st.textContent = `button:hover:not(:disabled){filter:brightness(1.06);}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}@keyframes drSpin{to{transform:rotate(360deg)}}input[type=number]::-webkit-inner-spin-button{opacity:.7;}`;
    document.head.appendChild(st);
  }, []);

  const startOver = () => {
    setStep(0); setElements([]); setResult(null); setTargetPages(3);
    setDocStyles({ title: { ...DEFAULT_DOC_STYLES.title }, h1: { ...DEFAULT_DOC_STYLES.h1 }, h2: { ...DEFAULT_DOC_STYLES.h2 }, paragraph: { ...DEFAULT_DOC_STYLES.paragraph }, table: { ...DEFAULT_DOC_STYLES.table }, bullets: { ...DEFAULT_DOC_STYLES.bullets }, pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins } });
  };

  return (
    <div className="relative min-h-screen text-white bg-[#0a0a0f] font-sans overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Outfit:wght@600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif !important; }
        .db-serif { font-family: 'DM Serif Display', serif !important; }
        .db-mono { font-family: 'DM Mono', monospace !important; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
      `}</style>
      {loadingPhase === "docx" && <LoadingOverlay phase="docx" />}

      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-[20%] right-[-15%] w-[50%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Central Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto min-h-screen flex flex-col pt-5 pb-20 px-4 sm:px-6 lg:px-8">

        {/* Navigation / Header */}
        <nav className="flex justify-between items-center py-3 px-5 md:px-6 bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.6)] rounded-2xl mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.4)] flex items-center justify-center" style={{ background: '#c7cbe8' }}>
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="brand-font text-[18px] text-white">DocReplacer</span>
          </div>

          <div className="hidden sm:flex justify-center items-center gap-2">
            {['Describe', 'Review', 'Done'].map((s, i) => {
              const done = step > i, active = step === i;
              return (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${active ? 'bg-indigo-500/10' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${done ? 'bg-white/10 text-white' : active ? 'text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/40'
                      }`} style={active ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`font-semibold text-[13px] ${active ? 'text-indigo-400' : done ? 'text-white/80' : 'text-white/40'}`}>{s}</span>
                  </div>
                  {i < 2 && <div className={`w-8 h-px transition-colors ${step > i ? 'bg-white/20' : 'bg-white/5'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a href="/" className="text-[13px] font-semibold text-white/50 hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-500/10">← Home</a>
            {step > 0 && <button onClick={startOver} className="text-[13px] font-semibold text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">Start Over</button>}
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center w-full">
          <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-6 md:p-10 relative">

            {step === 0 && (
              <Step1Prompt
                setLoadingPhase={setLoadingPhase}
                onDone={({ elements: els, docTitle, pages }) => {
                  setElements(els);
                  setTargetPages(pages);
                  setStep(1);
                }} />
            )}

            {step === 1 && (
              <Step2Editor
                elements={elements}
                setElements={setElements}
                docStyles={docStyles}
                setDocStyles={setDocStyles}
                targetPages={targetPages}
                setLoadingPhase={setLoadingPhase}
                onBack={() => setStep(0)}
                onDone={r => { setResult(r); setStep(2); }} />
            )}

            {step === 2 && result && (
              <Step3Result result={result} onStartOver={startOver} onBack={() => setStep(1)} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}