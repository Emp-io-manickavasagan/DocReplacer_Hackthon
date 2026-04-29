import React, { useState, useEffect, useRef } from 'react';
function LoadingOverlay({ phase }) {
  const msg = phase === "template" ? "Streaming from AI…" : phase === "docx" ? "Assembling .docx file…" : "Working…";
  return (
    <div className="fixed inset-0 z-[9000] bg-slate-900/50 backdrop-blur-md flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-[24px] py-10 px-12 flex flex-col items-center gap-5 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <div className="text-lg font-bold text-slate-900 tracking-tight">{msg}</div>
        <div className="text-[12px] text-slate-400 font-medium">This may take a moment…</div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
