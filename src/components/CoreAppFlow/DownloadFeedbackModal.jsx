import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
function DownloadFeedbackModal({ docTitle, onClose, onConfirm }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const modal = (
    <div
      className="dr-modal-wrap fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Before you download</div>
          <h3 className="db-serif text-xl text-slate-900 font-bold tracking-tight">Quick review</h3>
          <p className="text-[13px] text-slate-600 mt-2 font-medium leading-relaxed">
            Optional: rate your experience and leave a short note. We log this with your download to improve DocReplacer.
          </p>
          {docTitle ? (
            <p className="text-[12px] text-slate-500 mt-2 font-medium truncate" title={docTitle}>
              <span className="text-slate-400">Document:</span> {docTitle}
            </p>
          ) : null}
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rating</div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  className={`text-3xl leading-none px-1 py-0.5 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${n <= rating ? "text-amber-400" : "text-slate-200 hover:text-slate-300"}`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <button type="button" onClick={() => setRating(0)} className="ml-2 text-[12px] font-semibold text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="dr-download-feedback" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Feedback</label>
            <textarea
              id="dr-download-feedback"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What worked well or what could be better?"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/80 text-slate-800 text-[14px] placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 resize-y font-medium"
              maxLength={2000}
            />
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{comment.length} / 2000</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ rating: rating || null, comment })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white text-[14px] font-bold shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            ⬇ Download .docx
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}



export default DownloadFeedbackModal;
