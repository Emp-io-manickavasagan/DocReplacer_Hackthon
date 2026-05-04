import React, { useState, useEffect, useRef } from 'react';
import { buildDocx } from '../../utils/docxBuilder.js';
import StyleEditor from './StyleEditor.jsx';
import TemplateBlock from './TemplateBlock.jsx';
function Step2Editor({ elements, setElements, docStyles, setDocStyles, onBack, onDone, setLoadingPhase, targetPages }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateEl = (id, k, v) => setElements(t => t.map(el => el.id === id ? { ...el, [k]: v } : el));
  const removeEl = id => setElements(t => t.filter(el => el.id !== id));
  const moveUp = idx => { if (idx === 0) return; const t = [...elements];[t[idx - 1], t[idx]] = [t[idx], t[idx - 1]]; setElements(t); };
  const moveDown = idx => { if (idx === elements.length - 1) return; const t = [...elements];[t[idx], t[idx + 1]] = [t[idx + 1], t[idx]]; setElements(t); };
  const updateElBatch = (id, patches) => setElements(t => t.map(el => el.id === id ? { ...el, ...patches } : el));

  const build = async () => {
    setError(""); setLoading(true); setLoadingPhase("docx");
    try {
      const uint8 = await buildDocx(elements, docStyles);
      const titleEl = elements.find(e => e.type === "title");
      setLoadingPhase(null);
      onDone({ filled: elements, uint8, title: titleEl?.text || "Document" });
    } catch (e) {
      setError(e.message); setLoading(false); setLoadingPhase(null);
    }
  };



  const stats = [
    { label: "Blocks", value: elements.length, icon: "⬡" },
    { label: "Sections", value: elements.filter(e => e.type === "h1").length, icon: "§" },
    { label: "AI Content", value: elements.filter(e => ["paragraph", "body", "bullets", "table", "columns"].includes(e.type)).length, icon: "✦" },
  ];

  return (
    <div className="w-full flex flex-col">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.18em] mb-1">Step 2 <span className="text-white/20 mx-1">|</span> Review &amp; Edit</div>
          <h2 className="db-serif text-3xl text-white tracking-tight leading-tight">Generated Document</h2>
          <p className="text-white/40 text-[13px] mt-1 font-medium">Review every block, tweak content, then build your .docx file.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button onClick={onBack} className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-xl text-[13px] font-bold transition-all border border-white/[0.1]">← Regenerate</button>
          <button onClick={build} disabled={loading} className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${loading ? 'bg-white/[0.04] text-white/30 cursor-not-allowed' : 'text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)]'
            }`} style={!loading ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
            {loading ? "⟳ Building…" : "⬇ Build .docx"}
          </button>
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="flex gap-6 items-start">

        {/* LEFT PANEL — wider at 420px */}
        <div className="w-[420px] shrink-0 flex flex-col gap-4 sticky top-6">

          {/* Guiding message */}
          <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3.5">
            <span className="text-indigo-400 text-base shrink-0 mt-0.5">💡</span>
            <div className="text-[12px] text-indigo-200/90 font-medium leading-relaxed">
              <strong>Reviewing your document?</strong> Use the <span className="bg-indigo-500/20 px-1.5 py-0.5 rounded font-bold text-[11px] text-indigo-300">✦ AI</span> button on any block to rewrite, expand, or shorten it. Reorder blocks with ↑↓ arrows.
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl p-5 text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4">Document Stats</div>
            <div className="flex flex-col gap-3.5">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-85">
                    <span className="text-base opacity-60">{icon}</span>{label}
                  </div>
                  <div className="text-3xl font-black db-serif leading-none">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Style Settings */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <StyleEditor docStyles={docStyles} setDocStyles={setDocStyles} />
          </div>

          {/* Style hint */}
          <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
            <span className="text-white/40 text-sm shrink-0 mt-0.5">⚙️</span>
            <p className="text-[11px] text-white/50 font-medium leading-relaxed">Use <strong>Global Style Settings</strong> above to set fonts, colors, and spacing that apply to the entire document.</p>
          </div>

          {/* Build CTA */}
          <button onClick={build} disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all ${loading ? 'bg-white/[0.04] text-white/30 cursor-not-allowed' : 'text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-[1.01]'
            }`} style={!loading ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
            {loading ? "⟳ Building…" : "⬇ Build .docx File"}
          </button>
        </div>

        {/* RIGHT PANEL — Document Blocks */}
        <div className="flex-1 min-w-0">
          {/* Guiding header for block panel */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{elements.length} blocks</p>
            <p className="text-[11px] text-white/40 font-medium">Click any block to expand and edit</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            {elements.map((el, idx) => (
              <TemplateBlock key={el.id} el={el} idx={idx} total={elements.length}
                onUpdate={(k, v) => updateEl(el.id, k, v)}
                onUpdateBatch={patches => updateElBatch(el.id, patches)}
                onRemove={() => removeEl(el.id)}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)} />
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-4 text-sm font-medium flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center font-bold shrink-0">!</div>
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



export default Step2Editor;
