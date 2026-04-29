import React, { useState, useEffect, useRef } from 'react';
function Stepper({ step }) {
  const steps = ["Describe", "Review", "Done"];
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto justify-center mb-8">
      {steps.map((s, i) => {
        const done = step > i, active = step === i;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 shadow-sm ${done ? "bg-slate-800 text-white" : active ? "bg-indigo-600 text-white shadow-indigo-500/30 scale-110" : "bg-white border border-slate-200 text-slate-400"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-semibold transition-colors ${active ? "text-indigo-700" : done ? "text-slate-700" : "text-slate-400"} whitespace-nowrap`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 md:w-16 h-0.5 mx-3 md:mx-4 transition-colors ${step > i ? "bg-slate-800" : "bg-slate-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}


export default Stepper;
