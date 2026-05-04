import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../utils/constants.js';
import { callOpenAI } from '../../utils/groq.js';
import { safeParseJSON } from '../../utils/jsonParser.js';
import { hasTableData } from '../../utils/docxBuilder.js';
const TYPE_LABEL = { title: "Title", h1: "H1", h2: "H2", paragraph: "Paragraph", body: "Paragraph", bullets: "Bullets", hr: "Divider", table: "Table", columns: "Columns" };
const TYPE_BADGE = { title: { bg: C.blue900, text: C.white }, h1: { bg: C.blue700, text: C.white }, h2: { bg: C.blue100, text: C.blue800 }, paragraph: { bg: C.gray200, text: C.gray700 }, body: { bg: C.gray200, text: C.gray700 }, bullets: { bg: C.gray700, text: C.white }, hr: { bg: C.gray300, text: C.gray700 }, table: { bg: C.blue800, text: C.white }, columns: { bg: C.blue600, text: C.white } };
const TYPE_BG = { title: C.blue900, h1: C.blue50, h2: C.bgMuted, paragraph: C.gray100, body: C.gray100, bullets: C.gray100, hr: C.gray100, table: C.blue50, columns: C.blue50 };

function TemplateBlock({ el, idx, total, onUpdate, onUpdateBatch, onRemove, onMoveUp, onMoveDown }) {
  const badge = TYPE_BADGE[el.type] || TYPE_BADGE.paragraph;
  const bgColor = TYPE_BG[el.type] || C.gray100;
  const isTitle = el.type === "title", isHeading = el.type === "h1" || el.type === "h2";
  const isBody = el.type === "body" || el.type === "paragraph", isBullets = el.type === "bullets";
  const isHr = el.type === "hr", isTable = el.type === "table", isColumns = el.type === "columns";

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const inpClass = "w-full border border-white/[0.08] bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-white/30";
  const badgeClasses = {
    title: "bg-indigo-600 text-white", h1: "bg-slate-800 text-white",
    hr: "bg-slate-200 text-slate-500", default: "bg-slate-100 text-slate-600"
  };
  const getBadgeStyle = (t) => badgeClasses[t] || badgeClasses.default;

  // Safety: hide table blocks with no real data on the review page
  if (isTable && !hasTableData(el.headers || [], el.rows || [])) return null;

  /* ── current content snapshot for AI context ── */
  const currentContentStr = () => {
    if (isBody) return (el.texts || []).join("\n\n");
    if (isBullets) return (el.items || []).join("\n");
    if (isTable) return `Headers: ${(el.headers || []).join(", ")}\nRows:\n${(el.rows || []).map(r => r.join(" | ")).join("\n")}`;
    if (isColumns) return (el.texts || []).join("\n---\n");
    return el.text || "";
  };

  /* ── AI edit handler ── */
  const runAiEdit = async () => {
    if (!aiPrompt.trim()) { setAiError("Enter a prompt."); return; }
    setAiError(""); setAiLoading(true);
    try {
      const blockType = TYPE_LABEL[el.type] || el.type;
      const sectionTitle = el.text || (isBody && el.texts?.[0]?.slice(0, 60)) || blockType;
      const content = currentContentStr();
      const instruction = aiPrompt.trim();

      /* ── shared formatting reference ── */
      const fmtRef = `Inline formatting you may use (only where it genuinely improves clarity):
- **bold** → key terms, critical concepts, important phrases (2–4 per paragraph max)
- _italic_ → titles of works, technical jargon, subtle emphasis (use sparingly)
- [link text](https://url) → hyperlinks only when a real relevant URL fits naturally
- Never bold or italic random words — only where it meaningfully helps the reader`;

      /* ── detect intent to guide preservation rules ── */
      const isAddIntent = /(add|append|include|insert|more|extra|additional|another|\+)/i.test(instruction);
      const isReplaceIntent = /(replace|rewrite|redo|regenerate|change all|completely|from scratch)/i.test(instruction);
      const preserveNote = isAddIntent && !isReplaceIntent
        ? "IMPORTANT: The instruction is asking to ADD content. Keep ALL existing content intact and append the new content after it."
        : isReplaceIntent
          ? "The instruction is asking to fully replace or rewrite the content. You may discard the existing content."
          : "Preserve any existing content that the instruction does not explicitly ask to change.";

      let prompt = "";

      if (isTitle || isHeading) {
        prompt = `You are a professional editor refining a document ${blockType}.

Current ${blockType}: "${content}"

Edit instruction: "${instruction}"

Requirements:
- Apply the edit precisely — keep the same professional tone unless told otherwise
- The result must be concise and suitable as a document ${blockType}
- Do NOT add quotes, punctuation decoration, or commentary

Return ONLY the updated ${blockType} text on a single line:`;

      } else if (isBody) {
        prompt = `You are a professional editor working on a body section of a document.

Section topic: "${sectionTitle}"

Current content:
---
${content}
---

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}

Output rules:
- Return ONLY the final paragraph(s), separated by a blank line between each
- Each paragraph must be detailed, well-structured prose (minimum 80 words unless shortening was requested)
- Do NOT include headings, bullet points, JSON, preamble, or sign-off text
- Maintain the professional tone of the original unless the instruction changes it

Updated paragraphs:`;

      } else if (isBullets) {
        prompt = `You are a professional editor working on a bullet-point list in a document.

Section topic: "${sectionTitle}"

Existing bullets:
${content}

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}
- If adding: append new bullets AFTER all existing ones — never remove or alter existing bullets
- If replacing/rewriting: you may discard existing content
- Each bullet: start with **Bold Key Term**: then 15–25 words of specific explanation
- All bullets must be distinct with no overlapping content

Return ONLY a valid JSON array of all bullet strings (no markdown fences, no extra text):
["**Term**: explanation","**Term**: explanation",...]
JSON:`;

      } else if (isTable) {
        prompt = `You are a professional editor working on a data table in a document.

Section topic: "${sectionTitle}"

Current table:
${content}

Edit instruction: "${instruction}"

${preserveNote}
- All column values must be specific and meaningful — no placeholder text like "value1" or "N/A"
- Maintain consistent column count across all rows
- If adding rows: keep existing rows and append new ones after them

Return ONLY valid JSON in this exact format (no markdown fences, no extra text):
{"headers":["Header 1","Header 2","Header 3"],"rows":[["specific value","specific value","specific value"]]}
JSON:`;

      } else if (isColumns) {
        prompt = `You are a professional editor working on a ${el.cols || 2}-column layout in a document.

Section topic: "${sectionTitle}"

Current column content:
${content}

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}
- Each column must contain full, readable prose — not just a heading or a single sentence
- Maintain the ${el.cols || 2}-column structure

Return ONLY a valid JSON array with exactly ${el.cols || 2} strings (no markdown fences, no extra text):
["full column 1 text here","full column 2 text here"]
JSON:`;
      }

      const raw = await callOpenAI("", prompt, { max_tokens: 2000, temperature: 0.65 });

      /* parse & apply */
      if (isTitle || isHeading) {
        onUpdate("text", raw.replace(/^["']|["']$/g, "").trim());
      } else if (isBody) {
        const paras = raw.split(/\n\s*\n/).map(p => p.replace(/\n/g, " ").trim()).filter(p => p.length > 10);
        const newParas = paras.length ? paras : [raw.trim()];
        const finalParas = (isAddIntent && !isReplaceIntent)
          ? [...(el.texts || []), ...newParas]
          : newParas;
        onUpdate("texts", finalParas);
      } else if (isBullets) {
        try {
          const arr = safeParseJSON(raw);
          if (Array.isArray(arr)) onUpdate("items", arr.map(String).filter(Boolean));
          else throw new Error("not array");
        } catch (_) {
          const lines = raw.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(l => l.length > 5);
          onUpdate("items", lines.length ? lines : (el.items || []));
        }
      } else if (isTable) {
        try {
          const obj = safeParseJSON(raw);
          if (obj && obj.headers) onUpdateBatch({ headers: obj.headers, rows: obj.rows || [] });
          else throw new Error("no headers");
        } catch (_) { setAiError("AI returned invalid table JSON. Try again."); }
      } else if (isColumns) {
        try {
          const arr = safeParseJSON(raw);
          if (Array.isArray(arr)) onUpdate("texts", arr.map(String));
          else throw new Error("not array");
        } catch (_) { setAiError("AI returned invalid columns JSON. Try again."); }
      }

      setAiOpen(false); setAiPrompt("");
    } catch (e) {
      setAiError(e.message || "AI edit failed.");
    }
    setAiLoading(false);
  };

  return (
    <div className="mb-5 overflow-hidden bg-white/[0.03] border border-white/[0.06] rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-shadow">
      {/* ── Header row ── */}
      <div className={`flex items-center gap-3 px-5 py-3.5 ${isTitle ? 'bg-indigo-500/10' : 'bg-white/[0.02]'} ${!isHr ? 'border-b border-white/[0.06]' : ''}`}>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 font-mono ${getBadgeStyle(el.type)}`}>
          {TYPE_LABEL[el.type] || el.type}
        </span>

        {(isTitle || isHeading || isBody) && (
          <input value={el.text || ""} onChange={e => onUpdate("text", e.target.value)}
            placeholder={isBody ? "Body topic hint…" : "Heading text…"}
            className={`flex-1 bg-transparent outline-none ${isTitle ? 'text-lg font-bold text-white placeholder:text-indigo-300' : isHeading ? 'text-base font-bold text-white' : 'text-sm font-semibold text-white/80 placeholder:text-white/30'} w-0`} />
        )}

        {(isBullets || isTable || isColumns) && (
          <span className="flex-1 text-xs italic text-white/50 font-medium">
            {isBullets ? `${(el.items || []).length} points` : isTable ? `${(el.headers || []).length} cols · ${(el.rows || []).length} rows` : `${el.cols || 2}-column`}
          </span>
        )}

        <div className="flex gap-1.5 ml-auto shrink-0">
          {!isHr && (
            <button onClick={() => { setAiOpen(o => !o); setAiError(""); }} title="Edit with AI"
              className={`px-2.5 h-7 rounded-md text-xs font-bold transition-colors shadow-sm ${aiOpen ? 'bg-indigo-500 text-white' : isTitle ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}>
              ✦ AI
            </button>
          )}
          <button onClick={onMoveUp} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center border border-white/[0.06] rounded-md bg-white/[0.04] text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 shadow-sm transition-opacity">↑</button>
          <button onClick={onMoveDown} disabled={idx === total - 1} className="w-7 h-7 flex items-center justify-center border border-white/[0.06] rounded-md bg-white/[0.04] text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 shadow-sm transition-opacity">↓</button>
          {!isTitle && <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center border border-red-500/30 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shadow-sm font-bold text-xs">✕</button>}
        </div>
      </div>

      {/* ── AI Edit Panel ── */}
      {aiOpen && (
        <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 transition-all">
          <div className="text-xs font-bold text-indigo-300 mb-2.5">✦ Edit with AI — describe the change</div>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && runAiEdit()}
              placeholder="e.g. Make it more formal, add 2 more rows, shorten to 3 bullets…"
              disabled={aiLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium ${inpClass} ${aiLoading ? 'bg-white/[0.02] text-white/30' : 'bg-white/[0.03] text-white'}`}
            />
            <button onClick={runAiEdit} disabled={aiLoading}
              className={`px-5 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${aiLoading ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              {aiLoading ? "⟳ …" : "Apply"}
            </button>
            <button onClick={() => { setAiOpen(false); setAiPrompt(""); setAiError(""); }}
              className="px-4 py-2 bg-white/[0.04] text-white/70 border border-white/[0.1] rounded-lg text-sm font-semibold hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white transition-colors shadow-sm">
              Cancel
            </button>
          </div>
          {aiError && <div className="mt-2 text-xs font-semibold text-red-500">{aiError}</div>}
        </div>
      )}

      {/* ── Manual edit areas ── */}
      {isBullets && (
        <div className="p-4">
          {(el.items || []).map((item, i) => (
            <div key={i} className="flex gap-2.5 mb-2.5 items-center">
              <span className="text-white/40 shrink-0 text-xl leading-none mb-1">•</span>
              <input value={item} onChange={e => { const items = [...el.items]; items[i] = e.target.value; onUpdate("items", items); }} className={`flex-1 px-3 py-2 text-sm ${inpClass}`} />
              <button onClick={() => { const items = [...el.items]; items.splice(i, 1); onUpdate("items", items); }} className="text-red-400 hover:text-red-600 shrink-0 text-lg mx-1 flex items-center justify-center p-1 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("items", [...(el.items || []), "New point"])} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors pt-2 pb-1 ml-6">+ Add point</button>
        </div>
      )}
      {isBody && Array.isArray(el.texts) && el.texts.length > 0 && (
        <div className="p-4 space-y-3">
          {el.texts.map((t, i) => (
            <textarea key={i} value={t} rows={3} onChange={e => { const texts = [...el.texts]; texts[i] = e.target.value; onUpdate("texts", texts); }}
              className={`w-full px-4 py-3 text-sm leading-relaxed resize-y ${inpClass}`} />
          ))}
        </div>
      )}
      {isTable && (
        <div className="p-4 overflow-x-auto">
          {/* Header inputs */}
          <div className="flex gap-1.5 mb-2">
            {(el.headers || []).map((h, ci) => (
              <input key={ci} value={h} onChange={e => { const hs = [...el.headers]; hs[ci] = e.target.value; onUpdate("headers", hs); }}
                className={`flex-1 px-2.5 py-2 text-xs font-bold bg-indigo-500/20 border border-indigo-500/30 rounded-md focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder:text-indigo-300/50`} />
            ))}
          </div>
          {/* Row inputs */}
          {(el.rows || []).map((row, ri) => (
            <div key={ri} className="flex gap-1.5 mb-1.5">
              {(el.headers || []).map((_, ci) => (
                <input key={ci} value={(row[ci]) || ""} onChange={e => {
                  const rows = el.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? e.target.value : c) : r);
                  onUpdate("rows", rows);
                }} className={`flex-1 px-2.5 py-2 text-xs ${inpClass}`} />
              ))}
              <button onClick={() => onUpdate("rows", el.rows.filter((_, i) => i !== ri))}
                className="text-red-400 hover:text-red-600 shrink-0 text-lg px-2 flex items-center justify-center hover:bg-red-50 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("rows", [...(el.rows || []), Array((el.headers || []).length).fill("")])}
            className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors mt-3 pb-1.5">+ Add row</button>
        </div>
      )}
      {isColumns && (
        <div className="p-4 space-y-4">
          {Array(el.cols || 2).fill(null).map((_, i) => (
            <div key={i}>
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">Column {i + 1}</div>
              <textarea value={(el.texts || [])[i] || ""} rows={2}
                onChange={e => { const t = [...(el.texts || [])]; t[i] = e.target.value; onUpdate("texts", t); }}
                className={`w-full px-3 py-2.5 text-sm resize-y leading-relaxed ${inpClass}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




export default TemplateBlock;
