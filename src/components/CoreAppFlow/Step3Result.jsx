import React, { useState } from 'react';
import DocPreviewModal from './DocPreviewModal.jsx';
import { trackDownloadWithFeedback } from '../../tracking.js';

function Step3Result({ result, onStartOver, onBack }) {
  const { filled, uint8, title } = result;
  const [showPreview, setShowPreview] = useState(false);

  const runFileDownload = () => {
    try {
      if (!uint8 || !uint8.length) throw new Error("No file data");
      const name = (title.slice(0, 40).replace(/[^a-z0-9]/gi, "_") || "document") + ".docx";
      const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      trackDownloadWithFeedback();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + (err?.message || "unknown error"));
    }
  };



  const totalParas = filled.filter(e => e.type === "paragraph" || e.type === "body").reduce((s, e) => s + (e.texts?.length || 1), 0)
    + filled.filter(e => e.type === "bullets").reduce((s, e) => s + (e.items?.length || 1), 0);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-10 text-center">

      {showPreview && <DocPreviewModal uint8={uint8} title={title} onClose={() => setShowPreview(false)} />}

      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black mb-8 shadow-[0_10px_32px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>✓</div>

      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Complete</div>
      <h2 className="db-serif text-4xl md:text-[50px] text-white leading-tight tracking-tight mb-4">Document Ready!</h2>
      <p className="text-white/50 text-lg font-medium mb-10">"{title}" was successfully crafted.</p>

      {/* Guiding message */}
      <div className="w-full mb-10 flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 text-left">
        <span className="text-green-500 text-base shrink-0 mt-0.5">✅</span>
        <div className="text-[13px] text-green-400 font-medium leading-relaxed">
          Your .docx file is ready! Click <strong>Preview</strong> to review it in the browser, or <strong>Download</strong> to save it. You can go back to make changes anytime.
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12 w-full">
        {[["Blocks", filled.length], ["Paragraphs", totalParas], ["File Size", `${(uint8.length / 1024).toFixed(0)} KB`]].map(([l, v]) => (
          <div key={l} className="bg-white/[0.02] border border-white/[0.06] rounded-[20px] py-6 px-10 shadow-sm text-center min-w-[140px]">
            <div className="db-serif text-3xl font-bold text-indigo-300">{v}</div>
            <div className="text-[11px] text-white/40 mt-2 uppercase tracking-widest font-bold">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={onBack} className="px-6 py-3.5 bg-white/[0.04] text-white/60 border border-white/[0.08] hover:border-white/[0.15] shadow-sm hover:bg-white/[0.08] hover:text-white rounded-2xl text-[14px] font-bold transition-all">← Back to Review</button>
        <button onClick={() => setShowPreview(true)} className="px-6 py-3.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/30 rounded-2xl text-[14px] font-bold transition-all">◈ Preview</button>
        <button onClick={onStartOver} className="px-6 py-3.5 bg-white/[0.04] text-white/60 border border-white/[0.08] hover:border-white/[0.15] shadow-sm hover:bg-white/[0.08] hover:text-white rounded-2xl text-[14px] font-bold transition-all">↺ Start Over</button>
        <button type="button" onClick={runFileDownload} className="px-8 py-3.5 text-white rounded-2xl text-[15px] font-bold shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>⬇ Download .docx</button>
      </div>
    </div>
  );
}


export default Step3Result;