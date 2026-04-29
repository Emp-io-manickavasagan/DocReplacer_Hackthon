import React, { useState, useEffect, useRef } from 'react';
import { DOC_TYPES } from '../../utils/constants.js';
import { streamOpenAI } from '../../utils/groq.js';
import { sanitiseJsonStr, repairTruncated } from '../../utils/jsonParser.js';
import { trackPromptSubmitted } from '../../tracking.js';


function Step1Prompt({ onDone, setLoadingPhase }) {
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("professional");
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [streamLog, setStreamLog] = useState("");
  const abortRef = useRef(false);

  // Words per page on A4 ~350. Each body block = 1 paragraph.
  const wordsPerPara = pages <= 2 ? 120 : pages <= 4 ? 150 : 180;

  // Parse subtopics from prompt: lines/commas after a keyword like "subtopics:", "sections:", or a dash list
  const parsedSubtopics = (() => {
    const t = prompt.trim();
    // Match "subtopics: x, y, z" or "sections: x, y, z" or "topics: x, y, z"
    const kwMatch = t.match(/(?:subtopics?|sections?|topics?)\s*[:=]\s*(.+)/i);
    if (kwMatch) return kwMatch[1].split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    // Match bullet/dash list lines: "- item" or "* item"
    const dashLines = t.split('\n').filter(l => /^\s*[-*•]\s+\S/.test(l)).map(l => l.replace(/^\s*[-*•]\s+/, '').trim());
    if (dashLines.length >= 2) return dashLines;
    return null;
  })();

  let _nid = 0;
  const nid = () => ++_nid;

  /* ── JSON repair helper (only used for bullets/tables) ── */
  const parseJsonRobust = (raw) => {
    // Step 0: Strip markdown code fences entirely (LLMs sometimes wrap output in ```json ... ```)
    let clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    // Strip leading prose before first [ or {
    const fb = clean.search(/[\[{]/);
    if (fb > 0) clean = clean.slice(fb);
    // Also strip anything after the last matching ] or }
    const lastClose = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (lastClose !== -1 && lastClose < clean.length - 1) clean = clean.slice(0, lastClose + 1);
    // 1. Direct parse
    try { return JSON.parse(clean); } catch (_) { }
    // 2. sanitiseJsonStr (handles unescaped newlines/tabs/quotes inside strings + smart quotes + trailing commas)
    try { return JSON.parse(sanitiseJsonStr(clean)); } catch (_) { }
    // 3. Extract outermost [...] or {...}
    const m = clean.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!m) throw new Error("AI returned no JSON. The model may be overloaded — please try again.");
    const s = m[0];
    // 4. sanitise extracted block
    try { return JSON.parse(sanitiseJsonStr(s)); } catch (_) { }
    // 5. repair truncation then sanitise
    try { return JSON.parse(sanitiseJsonStr(repairTruncated(s))); } catch (_) { }
    throw new Error("AI response could not be parsed. Please try again.");
  };

  /* ── PHASE 1: fast outline ── */
  const getOutline = async () => {
    const userSections = parsedSubtopics;
    const targetSectionCount = userSections
      ? userSections.length
      : pages <= 2 ? 3 : pages <= 4 ? 5 : pages <= 6 ? 6 : 8;

    const densityNote = pages <= 2
      ? `SHORT doc (${pages}p): prose only, no columns, minimal bullets, max 1 table.`
      : pages <= 4
        ? `STANDARD doc (${pages}p): 1–2 bullet sections, max 1 table, h2s only where needed.`
        : pages <= 7
          ? `DETAILED doc (${pages}p): h2 subsections, 1 table, 2–3 bullet sections, optionally 1 columns.`
          : `COMPREHENSIVE doc (${pages}p): rich structure — h2s, tables, bullets, columns, hr dividers.`;

    const sectionInstruction = userSections
      ? `Sections: EXACTLY these ${targetSectionCount} h1s in order: ${userSections.map(s => `"${s}"`).join(", ")}. Use them verbatim as headings.`
      : `Sections: EXACTLY ${targetSectionCount} h1s. First="Introduction", last="Conclusion". Choose meaningful headings for the topic.`;

    const p =
      `Expert document architect. Create outline JSON for a ${docType}.
Topic: "${prompt.trim()}"
${sectionInstruction}
${densityNote}
Extras per section (after body): "h2:Title"|"bullets"|"table"|"columns"(≥5p, max 1 total, truly parallel only)|"hr"(max 2 total)|[]
Rules: vary block types; no generic headings; columns only for Pros/Cons-style contrast; table only for structured data.
ONLY valid JSON:
{"title":"...","sections":[{"heading":"...","extras":[]},{"heading":"...","extras":["bullets"]}]}
JSON:`;
    let raw = "";
    const gen = streamOpenAI("", p, { max_tokens: 600, temperature: 0.25, onStatus: setStreamLog });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      setStreamLog("Outlining: " + raw.slice(-60));
    }
    const outline = parseJsonRobust(raw);
    outline._targetSectionCount = targetSectionCount;
    return outline;
  };

  /* ── PHASE 2a: plain-text body paragraphs ── */
  const fillBodySection = async (docTitle, heading, numParas, previousSummary, onProgress) => {
    const contextNote = previousSummary
      ? `Do NOT repeat: ${previousSummary}`
      : `Opening section — set the stage.`;
    const p =
      `${docType} writer. Write ${numParas} body paragraph(s).
Doc: "${docTitle}" | Section: "${heading}"
${wordsPerPara}–${wordsPerPara + 50} words each. ${contextNote}
Rules: distinct aspects per para, natural transitions, **bold** key terms (2–4/para), _italic_ for jargon.
NO: "In this section…", closing summaries, filler phrases, fake stats, headings, bullets, JSON.
Paragraphs:`;
    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: Math.min(numParas * (wordsPerPara + 50) * 2, 1200),
      temperature: 0.35,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      onProgress(raw.length);
    }
    // Split on blank lines → array of paragraphs
    const paras = raw.split(/\n\s*\n/).map(p => p.replace(/\n/g, " ").trim()).filter(p => p.length > 40);
    return paras.length ? paras : [raw.trim()];
  };

  /* ── PHASE 2b–d: batched extras (bullets + table + columns in ONE call) ── */
  const fillExtras = async (docTitle, heading, extrasNeeded) => {
    // extrasNeeded: array of "bullets" | "table" | "columns"
    if (!extrasNeeded.length) return {};

    const parts = [];
    if (extrasNeeded.includes("bullets"))
      parts.push(`"bullets": JSON array of exactly 5 strings, each "**Bold Term**: 15–25 word explanation"`);
    if (extrasNeeded.includes("table"))
      parts.push(`"table": {"headers":["H1","H2","H3"],"rows":[4 rows of 3 specific values each]} — meaningful headers for "${heading}", NO generic names`);
    if (extrasNeeded.includes("columns"))
      parts.push(`"columns": array of exactly 2 strings representing genuinely contrasting aspects of "${heading}". Each must start with a meaningful bold label derived from the content (e.g. "**Advantages**: ...", "**Disadvantages**: ...", "**Pros**: ...", "**Cons**: ...", "**Benefits**: ...", "**Drawbacks**: ...") followed by 2–3 sentences. NEVER use the word "Label" as the label.`);

    const p =
      `${docType} writer. Doc: "${docTitle}" | Section: "${heading}"
Return ONE JSON object with ONLY these keys: ${extrasNeeded.join(", ")}
${parts.join("\n")}
NO markdown fences, no extra text.
JSON:`;

    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: extrasNeeded.length * 350 + 100,
      temperature: 0.3,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }

    let obj = null;
    try { obj = parseJsonRobust(raw); } catch (_) { }
    if (!obj) {
      try { obj = parseJsonRobust(raw.slice(raw.search(/\{/))); } catch (_) { }
    }
    if (!obj) return {};

    const result = {};

    if (extrasNeeded.includes("bullets") && Array.isArray(obj.bullets)) {
      result.bullets = obj.bullets.map(String).filter(Boolean).slice(0, 6);
    }

    if (extrasNeeded.includes("table") && obj.table?.headers) {
      const headers = obj.table.headers.map(h => String(h).trim()).filter(Boolean).slice(0, 4);
      const n = headers.length;
      const headerSet = new Set(headers.map(h => h.toLowerCase()));
      const rows = (Array.isArray(obj.table.rows) ? obj.table.rows : [])
        .map(row => {
          const cells = (Array.isArray(row) ? row : []).map(c => String(c || "").trim());
          while (cells.length < n) cells.push("—");
          return cells.slice(0, n).map(c => c || "—");
        })
        .filter(row => {
          const nonEmpty = row.filter(c => c && c !== "—").length;
          if (nonEmpty === 0) return false;
          const allMatchHeader = row.filter(c => c !== "—").every(c => headerSet.has(c.toLowerCase().trim()));
          return !allMatchHeader;
        });
      if (rows.length > 0) result.table = { headers, rows };
    }

    if (extrasNeeded.includes("columns") && Array.isArray(obj.columns) && obj.columns.length >= 2) {
      const cols = obj.columns.slice(0, 2).map(String).filter(Boolean);
      const w0 = cols[0].replace(/\*\*/g, "").trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
      const w1 = cols[1].replace(/\*\*/g, "").trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
      if (w0 !== w1) result.columns = cols;
    }

    return result;
  };

  /* ── PHASE 2e: batch h2 subsections in one call ── */
  const fillH2Batch = async (docTitle, heading, subHeadings, previousSummary) => {
    const p =
      `${docType} writer. Doc: "${docTitle}" | Parent section: "${heading}"
Write one body paragraph per subsection below. ${previousSummary ? `Do NOT repeat: ${previousSummary}` : ""}
${wordsPerPara}–${wordsPerPara + 40} words each. **bold** key terms (2–3/para). No filler, no "In this section…".
Return ONE JSON object keyed by subsection title:
${JSON.stringify(Object.fromEntries(subHeadings.map(s => [s, "paragraph text here"])))}
JSON:`;
    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: Math.min(subHeadings.length * (wordsPerPara + 40) * 2 + 100, 1400),
      temperature: 0.35,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }
    try {
      const obj = parseJsonRobust(raw);
      if (obj && typeof obj === "object") return obj;
    } catch (_) { }
    return {};
  };

  /* ── MAIN go() ── */
  const go = async () => {
    if (!prompt.trim()) { setError("Please describe your document."); return; }
    if (prompt.trim().length < 10) { setError("Please provide a more descriptive prompt (at least 10 characters)."); return; }
    if (prompt.length > 2000) { setError("Prompt is too long. Please keep it under 2000 characters."); return; }
    setError(""); setLoading(true); setTokens(0); setPhase("structure");
    setStreamLog("Connecting to AI…");
    setLoadingPhase("template");
    abortRef.current = false;
    _nid = 0;

    try {
      // ── Phase 1: outline (fast) ──
      const outline = await getOutline();
      if (abortRef.current || !outline) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }

      // Safety truncation: enforce exactly what was planned
      const rawSections = Array.isArray(outline.sections) ? outline.sections : [];
      const sections = rawSections.slice(0, outline._targetSectionCount || rawSections.length);
      if (!sections.length) throw new Error("Outline empty. Try again.");

      // Compute bodyPerSec dynamically based on actual section count and target pages
      const actualSecCount = sections.length;
      const totalTargetWords = pages * 350;
      const dynamicBodyPerSec = Math.max(1, Math.round((totalTargetWords * 0.75) / (actualSecCount * wordsPerPara)));

      setPhase("content");

      // ── Phase 2: sequential sections ──
      const elements = [];
      elements.push({ id: nid(), type: "title", text: outline.title || "Document" });

      let previousSummary = ""; // contextual memory for amnesia fix

      for (let i = 0; i < sections.length; i++) {
        if (abortRef.current) break;
        const sec = sections[i];
        const heading = sec.heading || `Section ${i + 1}`;
        const extras = Array.isArray(sec.extras) ? sec.extras : [];

        setStreamLog(`Section ${i + 1}/${sections.length}: ${heading}…`);
        setTokens(Math.round((i / sections.length) * 100));

        elements.push({ id: nid(), type: "h1", text: heading });

        // Body paragraphs
        const paras = await fillBodySection(outline.title || "Document", heading, dynamicBodyPerSec, previousSummary, (len) => {
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: ${Math.round(len / 4)} tokens`);
        });
        if (abortRef.current) break;
        if (paras) {
          elements.push({ id: nid(), type: "paragraph", texts: paras });
          previousSummary += (previousSummary ? " " : "") + `Section "${heading}": ${paras[0].slice(0, 100).replace(/\n/g, " ")}...`;
          const summaryParts = previousSummary.split('Section "');
          if (summaryParts.length > 3) previousSummary = 'Section "' + summaryParts.slice(-2).join('Section "');
        }

        // ── Batch 1: all h2 subsections in ONE call ──
        const h2Extras = extras.filter(e => typeof e === "string" && e.startsWith("h2:"));
        if (h2Extras.length > 0) {
          const subHeadings = h2Extras.map(e => e.slice(3).trim() || `${heading} — Details`);
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: writing ${subHeadings.length} subsections…`);
          const h2Results = await fillH2Batch(outline.title || "Document", heading, subHeadings, previousSummary);
          if (abortRef.current) break;
          for (const subHeading of subHeadings) {
            elements.push({ id: nid(), type: "h2", text: subHeading });
            const txt = h2Results?.[subHeading];
            if (txt) {
              elements.push({ id: nid(), type: "paragraph", texts: [String(txt).trim()] });
              previousSummary += ` Subsection "${subHeading}": ${String(txt).slice(0, 80)}...`;
            }
          }
        }

        // ── Batch 2: bullets + table + columns in ONE call ──
        const extrasNeeded = extras.filter(e => e === "bullets" || e === "table" || e === "columns");
        const hasHr = extras.includes("hr");

        if (extrasNeeded.length > 0) {
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: writing ${extrasNeeded.join(", ")}…`);
          const extrasResult = await fillExtras(outline.title || "Document", heading, extrasNeeded);
          if (abortRef.current) break;

          // Preserve outline ordering when inserting results
          for (const extra of extras) {
            if (extra === "bullets" && extrasResult?.bullets?.length) {
              elements.push({ id: nid(), type: "bullets", items: extrasResult.bullets });
            } else if (extra === "table" && extrasResult?.table) {
              elements.push({ id: nid(), type: "table", headers: extrasResult.table.headers, rows: extrasResult.table.rows });
            } else if (extra === "columns") {
              if (extrasResult?.columns?.length >= 2) {
                elements.push({ id: nid(), type: "columns", cols: 2, texts: extrasResult.columns });
              } else {
                // fallback: add as paragraph
                const fallbackParas = await fillBodySection(outline.title || "Document", heading + " (additional context)", 1, previousSummary, () => { });
                if (!abortRef.current && fallbackParas) elements.push({ id: nid(), type: "paragraph", texts: fallbackParas });
              }
            }
          }
        }

        if (hasHr) elements.push({ id: nid(), type: "hr" });
      }

      if (abortRef.current) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }
      setPhase("done");
      setLoadingPhase(null);
      onDone({ elements, docTitle: outline.title || "Document", pages });

    } catch (e) {
      setError(e.message);
      setLoading(false);
      setLoadingPhase(null);
      setPhase("idle");
    }
  };

  const cancel = () => { abortRef.current = true; };
  const pageLabel = pages === 1 ? "Short overview" : pages <= 2 ? "Brief report" : pages <= 4 ? "Standard document" : pages <= 6 ? "Detailed report" : "Comprehensive report";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="db-serif text-4xl md:text-[52px] text-slate-900 tracking-tight leading-tight mb-4 text-center">
          What do you want to create?
        </h2>
        <p className="text-slate-500 text-base md:text-lg font-medium">
          One prompt → full .docx, streamed in real time.
        </p>
      </div>

      {/* Guiding tip */}
      <div className="w-full mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
        <span className="text-amber-500 text-lg shrink-0 mt-0.5">💡</span>
        <div className="text-[13px] text-amber-800 font-medium leading-relaxed">
          <strong>Tip:</strong> Be specific in your prompt. Mention the audience, purpose, and tone (e.g. <em>"a formal Q3 sales report for investors"</em>). The more context you give, the better the output.
        </div>
      </div>

      <div className="w-full space-y-6 bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-[28px] border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
        {/* Prompt input */}
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Document Prompt</label>
          <textarea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={loading}
            placeholder='e.g. "Technical report on Python vs JavaScript for web development — for a software engineering audience"'
            className="w-full px-5 py-4 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 transition-all resize-y text-[15px] leading-relaxed placeholder:text-slate-400 font-medium" />
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-slate-400 font-medium">Press Generate below when you're ready</p>
            <p className={`text-[11px] font-semibold ${prompt.length > 20 ? 'text-indigo-500' : 'text-slate-300'}`}>{prompt.length} chars</p>
          </div>
          <div className="mt-4 flex items-start gap-2 px-1">
            <span className="text-slate-400 text-xs shrink-0 mt-0.5">⚠️</span>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              <strong>MVP Notice:</strong> As this is an early-release version, some document formatting, content alignment, and page accuracy may vary. <strong>AI may make mistakes</strong> — please check and verify all generated content.
            </p>
          </div>
          <div className="mt-2 flex items-start gap-2 px-1">
            <span className="text-slate-400 text-xs shrink-0 mt-0.5">🛡️</span>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              <strong>Security Warning:</strong> Do not give sensitive information (e.g., passwords or personal details) in the prompt.
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Doc type */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Document Type</div>
            <p className="text-[11px] text-slate-400 mb-4 font-medium">Affects writing tone and structure</p>
            <div className="flex flex-col gap-1.5">
              {DOC_TYPES.map(dt => {
                const a = docType === dt.value;
                return (
                  <button key={dt.value} onClick={() => setDocType(dt.value)} disabled={loading}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all ${a ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-400/30' : 'bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200 hover:text-slate-700'}`}>
                    <span className={`text-base ${a ? 'text-indigo-600' : 'text-slate-400'}`}>{dt.icon}</span>
                    {dt.label}
                    {a && <span className="ml-auto text-indigo-600 font-black text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Length */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Page Length</div>
              <span className="text-indigo-700 font-black text-[13px] px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">{pages} page{pages > 1 ? "s" : ""}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 font-medium">More pages = more sections & detail</p>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                const a = pages === n;
                return (
                  <button key={n} onClick={() => setPages(n)} disabled={loading}
                    className={`h-10 rounded-xl db-mono text-sm font-bold transition-all ${a ? 'text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    style={a ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-[13px] font-bold text-slate-900 mb-1">{pageLabel}</div>
              <div className="text-[11px] text-slate-400 font-semibold">~{pages * 400} words · AI-chosen layout</div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="w-full mt-8 flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-sm text-center">
          <div className="w-9 h-9 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
          <div className="text-sm font-bold text-slate-900">{phase === "done" ? "Completing…" : "Generating Document…"}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1 db-mono truncate max-w-md">{streamLog || "Initializing generation…"}</div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">You can cancel at any time below</div>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-[13px] mt-8 font-medium flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">!</div>
          <p>{error}</p>
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-8 mb-6">
        <button onClick={go} disabled={loading || !prompt.trim()}
          className={`w-full py-4 px-8 rounded-full font-bold text-[15px] flex items-center justify-center gap-3 transition-all ${loading || !prompt.trim()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)] hover:scale-[1.01]'
            }`}
          style={!(loading || !prompt.trim()) ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
          {loading
            ? <><span className="animate-spin inline-block font-mono text-xl leading-none">⟳</span> Streaming document…</>
            : <>✦ Generate Document</>}
        </button>
        {loading && (
          <button onClick={cancel} className="py-4 px-6 w-full sm:w-auto bg-white border border-red-200 text-red-600 rounded-full font-bold text-[13px] hover:bg-red-50 transition-colors uppercase tracking-widest whitespace-nowrap">Cancel</button>
        )}
      </div>
    </div>
  );
}


export default Step1Prompt;