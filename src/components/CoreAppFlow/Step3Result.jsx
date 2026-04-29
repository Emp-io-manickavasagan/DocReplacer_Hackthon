import React, { useState, useEffect, useRef } from 'react';
import { trackDownloadWithFeedback } from '../../tracking.js';
import DocPreviewModal from './DocPreviewModal.jsx';
import DownloadFeedbackModal from './DownloadFeedbackModal.jsx';
function Step3Result({ result, onStartOver, onBack }) {
  const { filled, uint8, title } = result;
  const [showPreview, setShowPreview] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const runFileDownload = () => {
    try {
      if (!uint8 || !uint8.length) throw new Error("No file data");
      const name = (title.slice(0, 40).replace(/[^a-z0-9]/gi, "_") || "document") + ".docx";
      const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + (err?.message || "unknown error"));
    }
  };

  const confirmDownloadWithFeedback = async ({ rating, comment }) => {
    try { await trackDownloadWithFeedback({ rating, comment }); } catch (_) { /* never block download on tracking errors */ }
    runFileDownload();
    // Close AFTER onConfirm returns so modal's setLoading(false) runs before unmount
    setTimeout(() => setDownloadModalOpen(false), 50);
  };

  const totalParas = filled.filter(e => e.type === "paragraph" || e.type === "body").reduce((s, e) => s + (e.texts?.length || 1), 0)
    + filled.filter(e => e.type === "bullets").reduce((s, e) => s + (e.items?.length || 1), 0);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-10 text-center">
      {downloadModalOpen && (
        <DownloadFeedbackModal
          docTitle={title}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={confirmDownloadWithFeedback}
        />
      )}
      {showPreview && <DocPreviewModal uint8={uint8} title={title} onClose={() => setShowPreview(false)} />}

      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black mb-8 shadow-[0_10px_32px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>✓</div>

      <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3">Complete</div>
      <h2 className="db-serif text-4xl md:text-[50px] text-slate-900 leading-tight tracking-tight mb-4">Document Ready!</h2>
      <p className="text-slate-500 text-lg font-medium mb-10">"{title}" was successfully crafted.</p>

      {/* Guiding message */}
      <div className="w-full mb-10 flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4 text-left">
        <span className="text-green-500 text-base shrink-0 mt-0.5">✅</span>
        <div className="text-[13px] text-green-800 font-medium leading-relaxed">
          Your .docx file is ready! Click <strong>Preview</strong> to review it in the browser, or <strong>Download</strong> to save it. You can go back to make changes anytime.
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12 w-full">
        {[["Blocks", filled.length], ["Paragraphs", totalParas], ["File Size", `${(uint8.length / 1024).toFixed(0)} KB`]].map(([l, v]) => (
          <div key={l} className="bg-white border border-slate-100 rounded-[20px] py-6 px-10 shadow-sm text-center min-w-[140px]">
            <div className="db-serif text-3xl font-bold text-indigo-700">{v}</div>
            <div className="text-[11px] text-slate-400 mt-2 uppercase tracking-widest font-bold">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={onBack} className="px-6 py-3.5 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm hover:bg-slate-50 rounded-2xl text-[14px] font-bold transition-all">← Back to Review</button>
        <button onClick={() => setShowPreview(true)} className="px-6 py-3.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-2xl text-[14px] font-bold transition-all">◈ Preview</button>
        <button onClick={onStartOver} className="px-6 py-3.5 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm hover:bg-slate-50 rounded-2xl text-[14px] font-bold transition-all">↺ Start Over</button>
        <button type="button" onClick={() => setDownloadModalOpen(true)} className="px-8 py-3.5 text-white rounded-2xl text-[15px] font-bold shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>⬇ Download .docx</button>
      </div>
    </div>
  );
}


export default Step3Result;