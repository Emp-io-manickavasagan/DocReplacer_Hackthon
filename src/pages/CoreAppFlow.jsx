import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

/* ════════════════════════════════════════════════
   COLORS
════════════════════════════════════════════════ */
const C = {
  white:"#ffffff", bg:"#f8fafc", bgMuted:"#f1f5f9",
  border:"#e2e8f0",
  blue900:"#1e3a8a", blue800:"#1e40af", blue700:"#1d4ed8",
  blue600:"#2563eb", blue500:"#3b82f6", blue400:"#60a5fa",
  blue300:"#93c5fd", blue200:"#bfdbfe", blue100:"#dbeafe", blue50:"#eff6ff",
  black:"#000000", gray900:"#111827", gray800:"#1f2937",
  gray700:"#374151", gray600:"#4b5563", gray500:"#6b7280",
  gray400:"#9ca3af", gray300:"#d1d5db", gray200:"#e5e7eb", gray100:"#f3f4f6",
  text:"#111827", textSub:"#4b5563", textMuted:"#9ca3af",
  ok:"#16a34a", err:"#dc2626", errBg:"#fef2f2", errBorder:"#fca5a5",
  purple:"#7c3aed", purpleBg:"#f5f3ff", purpleBorder:"#ddd6fe",
  teal:"#0d9488", tealBg:"#f0fdfa", tealBorder:"#99f6e4",
};

/* ════════════════════════════════════════════════
   DEFAULT DOC STYLES
════════════════════════════════════════════════ */
// Bullet style definitions: name → { numFmt, lvlText, font }
// lvlText values are literal Unicode chars (not HTML entities) for correct XML embedding
const BULLET_STYLES = {
  "Disc (•)":    { numFmt:"bullet", lvlText:"\uF0B7", font:"Symbol"    }, // Symbol font private-use disc
  "Circle (○)":  { numFmt:"bullet", lvlText:"\uF06F", font:"Wingdings" }, // Wingdings hollow circle
  "Square (▪)":  { numFmt:"bullet", lvlText:"\uF0A7", font:"Wingdings" }, // Wingdings filled square
  "Dash (–)":    { numFmt:"bullet", lvlText:"\u2013", font:"Arial"     }, // en-dash, any font
};
const BULLET_STYLE_NAMES = Object.keys(BULLET_STYLES);

const DEFAULT_DOC_STYLES = {
  title:      { font:"Arial",           size:24, color:"#000000", align:"center",  bold:true,  italic:false, marginTop:0,  marginBottom:12, lineSpacing:1.15, bgColor:"" },
  h1:         { font:"Times New Roman", size:18, color:"#000000", align:"left",    bold:true,  italic:false, marginTop:16, marginBottom:18, lineSpacing:1.15, bgColor:"" },
  h2:         { font:"Times New Roman", size:14, color:"#000000", align:"left",    bold:true,  italic:false, marginTop:10, marginBottom:12, lineSpacing:1.15, bgColor:"" },
  paragraph:  { font:"Times New Roman", size:12, color:"#000000", align:"justify", bold:false, italic:false, marginTop:0,  marginBottom:8,  lineSpacing:1.5,  bgColor:"" },
  table:      { font:"Times New Roman", size:11, color:"#000000", headerBg:"#1e3a8a", headerColor:"#ffffff", rowAltBg:"#eff6ff", borderColor:"#374151", lineSpacing:1.15 },
  bullets:    { styleName:"Disc (•)", indentLeft:720, hanging:360, itemSpacingAfter:6, lineSpacing:1.5 },
  // Page margins in inches (Word standard: Normal=1", Narrow=0.5", Wide=2")
  pageMargins:{ top:1.0, bottom:1.0, left:1.0, right:1.0 },
};

/* ════════════════════════════════════════════════
   UTILS
════════════════════════════════════════════════ */
let _uid = 0;
const uid    = () => ++_uid;
const xmlEsc  = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const attrEsc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const pt2hp  = pt => Math.round(pt*2);
const pt2dxa = pt => Math.round(pt*20);
const ls2dxa = ls => Math.round(ls*240);
const hexCol = c  => (c||"#000000").replace("#","").toUpperCase();
const wAlign = a  => a==="justify"?"both":a==="right"?"end":a==="center"?"center":"start";

/* ════════════════════════════════════════════════
   OLLAMA
════════════════════════════════════════════════ */
async function callOllama(baseUrl, prompt, opts={}) {
  const url=(baseUrl||"http://localhost:11434").replace(/\/$/,"");
  const res=await fetch(`${url}/api/chat`,{
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      model: opts.model || "qwen2.5:7b",
      messages: [{role:"user", content:prompt}],
      stream: false,
      options: {
        num_ctx:   opts.num_ctx    || 8192,
        num_predict: opts.num_predict || 4096,
        temperature: opts.temperature ?? 0.7,
      }
    }),
  });
  if(!res.ok){const t=await res.text().catch(()=>"");throw new Error(`Ollama ${res.status} — Run: OLLAMA_ORIGINS=* ollama serve\n${t.slice(0,200)}`);}
  const d=await res.json();
  return d.message?.content||"";
}

/* ════════════════════════════════════════════════
   JSON PARSER  — robust, handles truncation
════════════════════════════════════════════════ */
function sanitiseJsonStr(s){
  return s
    // smart / curly quotes → straight
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/[\u201C\u201D]/g,'"')
    // strip actual newlines / tabs inside strings (common LLM mistake)
    .replace(/("(?:[^"\\]|\\.)*")/g, m =>
      m.replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t")
    )
    // remove trailing commas before ] or }
    .replace(/,\s*([}\]])/g,"$1");
}

function repairTruncated(src){
  // Close any open string, then close open brackets/braces
  let inStr=false,esc=false;
  const stack=[];
  for(let i=0;i<src.length;i++){
    const c=src[i];
    if(esc){esc=false;continue;}
    if(c==="\\"&&inStr){esc=true;continue;}
    if(c==='"'){inStr=!inStr;continue;}
    if(!inStr){
      if(c==="{"||c==="[") stack.push(c==="{"?"}":"]");
      else if(c==="}"||c==="]") stack.pop();
    }
  }
  let result=src;
  if(inStr) result+='"';          // close open string
  result+=stack.reverse().join(""); // close open brackets
  return result;
}

function extractObjects(src){
  const out=[];
  let i=0;
  while(i<src.length){
    const s=src.indexOf("{",i);
    if(s===-1)break;
    let depth=0,inStr=false,esc=false,j=s;
    for(;j<src.length;j++){
      const c=src[j];
      if(esc){esc=false;continue;}
      if(c==="\\"&&inStr){esc=true;continue;}
      if(c==='"'){inStr=!inStr;continue;}
      if(!inStr){
        if(c==="{")depth++;
        else if(c==="}"){depth--;if(depth===0)break;}
      }
    }
    const chunk=src.slice(s,j+1);
    try{out.push(JSON.parse(sanitiseJsonStr(chunk)));}
    catch(_){
      try{out.push(JSON.parse(sanitiseJsonStr(repairTruncated(chunk))));}
      catch(__){/* skip unparseable object */}
    }
    i=j+1;
  }
  return out;
}

function safeParseJSON(raw){
  // 1. Strip code fences
  let src=raw.replace(/```json[\s\S]*?```/gi,m=>m.replace(/```json|```/gi,""))
             .replace(/```/g,"").trim();

  // 2. Strip leading/trailing text that wraps the JSON (e.g. 'Here is the JSON: [...]')
  // Only keep the portion starting from first [ or {
  const firstBracket = src.search(/[\[{]/);
  if (firstBracket > 0) src = src.slice(firstBracket);

  // 3. Try direct parse
  try{const r=JSON.parse(src);if(Array.isArray(r)&&r.length)return r;}catch(_){}

  // 4. Try sanitised parse
  try{const r=JSON.parse(sanitiseJsonStr(src));if(Array.isArray(r)&&r.length)return r;}catch(_){}

  // 5. Extract the outermost [...] block
  const arrM=src.match(/\[[\s\S]*\]/);
  if(arrM){
    const arrStr=arrM[0];
    try{const r=JSON.parse(arrStr);if(Array.isArray(r)&&r.length)return r;}catch(_){}
    try{const r=JSON.parse(sanitiseJsonStr(arrStr));if(Array.isArray(r)&&r.length)return r;}catch(_){}
    // 6. Truncated array — try repairing then parsing
    try{const r=JSON.parse(sanitiseJsonStr(repairTruncated(arrStr)));if(Array.isArray(r)&&r.length)return r;}catch(_){}
  }

  // 7. Last resort — pull out every {...} object individually
  const objs=extractObjects(src);
  if(objs.length)return objs;

  throw new Error("Could not parse AI JSON after all repair attempts. Raw snippet: "+raw.slice(0,200));
}

const VALID_TEMPLATE_TYPES = new Set(["title","h1","h2","paragraph","body","bullets","hr","table","columns"]);

function toStr(v, fallback="") {
  if (v === null || v === undefined) return fallback;
  return String(v).trim();
}

function toArr(v) {
  return Array.isArray(v) ? v : [];
}

function uniqueByIdKeepLast(arr) {
  const map = new Map();
  arr.forEach(item => map.set(Number(item.id), item));
  return [...map.values()];
}

function normalizeTemplate(rawTemplate) {
  const input = Array.isArray(rawTemplate) ? rawTemplate : [];
  const normalized = input
    .map((el, idx) => {
      const type = VALID_TEMPLATE_TYPES.has(el?.type) ? (el.type === "body" ? "paragraph" : el.type) : "paragraph";
      const base = { id: uid(), type };

      if (type === "title")   return { ...base, text: toStr(el?.text, "Document Title") };
      if (type === "h1")      return { ...base, text: toStr(el?.text, `Section ${idx + 1}`) };
      if (type === "h2")      return { ...base, text: toStr(el?.text, `Subsection ${idx + 1}`) };
      if (type === "paragraph") return { ...base, text: toStr(el?.text, "Describe what this paragraph covers…") };
      if (type === "hr")      return { ...base };
      if (type === "bullets") {
        const items = toArr(el?.items).map(i => toStr(i)).filter(Boolean).slice(0, 8);
        return { ...base, items: items.length ? items : ["First point", "Second point", "Third point"] };
      }
      if (type === "table") {
        const headers  = toArr(el?.headers).map(h => toStr(h)).filter(Boolean);
        const rows     = toArr(el?.rows).map(row => toArr(row).map(c => toStr(c)));
        const rowCount = Number(el?.rowCount || el?.row_count || el?.numRows || el?.num_rows) || 0;
        const finalRowCount = rowCount > 0 ? Math.min(rowCount, 20) : Math.max(rows.length, 3);
        return { ...base, headers: headers.length ? headers : ["Column 1","Column 2","Column 3"], rows, rowCount: finalRowCount };
      }
      if (type === "columns") {
        const cols  = Math.min(Math.max(Number(el?.cols) || 2, 2), 3);
        const texts = toArr(el?.texts).map(t => toStr(t)).slice(0, cols);
        while (texts.length < cols) texts.push(`Column ${texts.length + 1} — describe content here`);
        return { ...base, cols, texts };
      }
      return base;
    })
    .filter(el => !!el.type);

  const hasTitle = normalized.some(el => el.type === "title");
  if (!hasTitle) normalized.unshift({ id: uid(), type: "title", text: "Document Title" });

  const firstTitle    = normalized.find(el => el.type === "title");
  const withTitleFirst = [firstTitle, ...normalized.filter(el => el !== firstTitle && el.type !== "title")];

  return withTitleFirst.slice(0, 40);
}

function normalizeContentForDoc(template, rawContent) {
  const incoming = uniqueByIdKeepLast(toArr(rawContent));
  const byId = new Map(incoming.map(item => [Number(item.id), item]));

  const asBulletItems = (value, fallbackItems = []) => {
    const arr = Array.isArray(value) ? value : [];
    const fromArray = arr.map(v => toStr(v)).filter(Boolean);
    if (fromArray.length) return fromArray.slice(0, 12);
    if (typeof value === "string") {
      const split = value.split(/\n|•|- /g).map(v => toStr(v)).filter(Boolean);
      if (split.length) return split.slice(0, 12);
    }
    return fallbackItems.length ? fallbackItems : ["Point 1", "Point 2", "Point 3"];
  };

  return template.map(el => {
    const match = byId.get(Number(el.id));
    if (!match) return el;

    // Non-AI-filled structural types — never overwrite with AI content
    if (["title", "h1", "h2", "hr"].includes(el.type)) return el;

    if (el.type === "bullets") {
      return { ...el, items: asBulletItems(match.items, toArr(el.items).map(v => toStr(v)).filter(Boolean)) };
    }
    if (el.type === "table") {
      const n = (el.headers || []).length || 2;
      const expected = el.rowCount || 3;
      const headerSet = new Set((el.headers || []).map(h => String(h).toLowerCase().trim()));

      // Bulletproof cell cleaner: strip surrounding quotes, whitespace, tabs, NBSPs
      const cleanCell = v => String(v ?? "")
        .trim()
        .replace(/^["']|["']$/g, "")   // strip wrapping quotes LLMs sometimes emit
        .replace(/[\t\u00A0]/g, " ")   // tabs and non-breaking spaces → regular space
        .trim();

      // Normalize rows: accept nested arrays, array of CSV strings, OR one big CSV/newline blob
      let rawRows = match.rows;

      // If it's not an array at all, try to coerce from string
      if (!Array.isArray(rawRows)) {
        const s = typeof rawRows === "string" ? rawRows.trim() : "";
        if (s) {
          // Try JSON array first (LLM sometimes sends stringified JSON)
          try {
            const parsed = JSON.parse(s);
            rawRows = Array.isArray(parsed) ? parsed : [parsed];
          } catch (_) {
            // Fall back: split on newlines
            rawRows = s.split("\n").map(r => r.trim()).filter(Boolean);
          }
        } else {
          rawRows = [];
        }
      }

      const normalizedRows = rawRows.map(row => {
        if (Array.isArray(row)) return row.map(cleanCell);
        if (typeof row === "string" && row.trim()) {
          // Split on comma but respect quoted fields (simple greedy split is fine for LLM output)
          return row.split(",").map(cleanCell);
        }
        return [];
      }).filter(row => row.length > 0);

      const aiRows = normalizedRows.map(cells => {
        while (cells.length < n) cells.push("—");
        return cells.slice(0, n).map(c => c.trim() || "—");
      }).filter(row => {
        if (!row.some(c => c !== "—")) return false;
        const allMatchHeader = row.every(c => headerSet.has(c.toLowerCase().trim()));
        return !allMatchHeader;
      });

      // Only pad if we actually got some real rows from AI
      const finalRows = [...aiRows];
      if (finalRows.length > 0) {
        while (finalRows.length < expected) {
          finalRows.push(Array(n).fill("—"));
        }
      }
      return { ...el, rows: finalRows.slice(0, expected) };
    }
    if (el.type === "columns") {
      const numCols = el.cols || 2;
      const aiTexts = toArr(match.texts).map(v => toStr(v));
      // Merge: use AI text per column if present, else keep existing hint
      const merged = Array(numCols).fill(null).map((_, i) =>
        (aiTexts[i] && aiTexts[i].trim()) ? aiTexts[i] : (toStr((el.texts || [])[i]) || `Column ${i + 1}`)
      );
      return { ...el, texts: merged };
    }
    // body and all other AI-fillable text types
    const texts = toArr(match.texts).map(v => toStr(v)).filter(Boolean);
    return { ...el, texts: texts.length ? texts : [toStr(el.text, "Content not generated.")] };
  });
}

/* ════════════════════════════════════════════════
   DOCX BUILDER
════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════
   INLINE RICH TEXT PARSER
   Supports: **bold**, _italic_, **_both_**, [text](url)
════════════════════════════════════════════════ */
function parseInlineRuns(text) {
  const runs = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*_(.+?)_\*\*|_\*\*(.+?)\*\*_|\*\*(.+?)\*\*|_(.+?)_/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), bold: false, italic: false, url: null });
    if      (m[1] !== undefined) runs.push({ text: m[1], bold: false, italic: false, url: m[2] });
    else if (m[3] !== undefined) runs.push({ text: m[3], bold: true,  italic: true,  url: null });
    else if (m[4] !== undefined) runs.push({ text: m[4], bold: true,  italic: true,  url: null });
    else if (m[5] !== undefined) runs.push({ text: m[5], bold: true,  italic: false, url: null });
    else if (m[6] !== undefined) runs.push({ text: m[6], bold: false, italic: true,  url: null });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false, italic: false, url: null });
  return runs.filter(r => r.text);
}

function runsToXml(runs, baseRPr) {
  return runs.map(run => {
    const b = run.bold   ? "<w:b/><w:bCs/>" : "";
    const i = run.italic ? "<w:i/><w:iCs/>" : "";
    if (run.url) {
      const rPr = baseRPr.replace(/<\/w:rPr>/, `<w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr>`);
      return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
    }
    if (run.bold || run.italic) {
      const rPr = baseRPr.replace(/<\/w:rPr>/, `${b}${i}</w:rPr>`);
      return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
    }
    return `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
  }).join("");
}

function makeRichParaXml(text, type, docStyles) {
  // Fix: if array, create a separate <w:p> for every item (no joining = no wall of text)
  if (Array.isArray(text)) {
    return text.map(t => makeRichParaXml(String(t ?? ""), type, docStyles)).join("\n");
  }
  text = String(text ?? "");
  const s    = (docStyles||DEFAULT_DOC_STYLES)[type] || (docStyles||DEFAULT_DOC_STYLES).paragraph || (docStyles||DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const szHp = pt2hp(s.size);
  const col  = hexCol(s.color);
  const jc   = wAlign(s.align);
  const bold = s.bold   ? "<w:b/><w:bCs/>"  : "";
  const ital = s.italic ? "<w:i/><w:iCs/>" : "";
  const ls   = ls2dxa(s.lineSpacing || 1.5);
  const bef  = pt2dxa(s.marginTop   || 0);
  const aft  = pt2dxa(s.marginBottom|| 8);
  // Fix 3: Use native Word styles for semantic hierarchy (Navigation Pane + ToC support)
  const pStyle = (type==="body"||type==="paragraph") ? `<w:pStyle w:val="ProfessionalBody"/>`
               : type==="h1"    ? `<w:pStyle w:val="Heading1"/>`
               : type==="h2"    ? `<w:pStyle w:val="Heading2"/>`
               : type==="title" ? `<w:pStyle w:val="Title"/>`
               : "";
  const bgFill = s.bgColor && s.bgColor !== "" ? `<w:shd w:val="clear" w:color="auto" w:fill="${hexCol(s.bgColor)}"/>` : "";
  const pPr    = `<w:pPr>${pStyle}${bgFill}<w:jc w:val="${jc}"/><w:spacing w:line="${ls}" w:lineRule="auto" w:before="${bef}" w:after="${aft}"/></w:pPr>`;
  const baseRPr= `<w:rPr><w:rFonts w:ascii="${s.font}" w:hAnsi="${s.font}" w:cs="${s.font}"/>${bold}${ital}<w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${col}"/></w:rPr>`;
  const runs   = parseInlineRuns(text);
  const content= runs.length > 0 ? runsToXml(runs, baseRPr) : `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;
  return `<w:p>${pPr}${content}</w:p>`;
}

// makeParaXml removed — superseded by makeRichParaXml (supports inline bold/italic/links).

function makeHrXml() {
  return `<w:p><w:pPr><w:spacing w:before="120" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="9CA3AF"/></w:pBdr></w:pPr></w:p>`;
}

function makeBulletXml(items, docStyles) {
  const s    = (docStyles||DEFAULT_DOC_STYLES).paragraph || (docStyles||DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const bs   = (docStyles||DEFAULT_DOC_STYLES).bullets || DEFAULT_DOC_STYLES.bullets;
  const font = s.font || "Times New Roman";
  const szHp = pt2hp(s.size);
  const col  = hexCol(s.color);
  const ls   = ls2dxa(bs.lineSpacing || s.lineSpacing || 1.5);
  const aft  = pt2dxa(bs.itemSpacingAfter ?? 6);
  const indL = bs.indentLeft || 720;
  const hang = bs.hanging    || 360;
  const baseRPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${col}"/></w:rPr>`;
  return (Array.isArray(items) ? items : ["Item"]).map(item => {
    const runs = parseInlineRuns(item);
    const content = runs.length > 0
      ? runsToXml(runs, baseRPr)
      : `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(item)}</w:t></w:r>`;
    return `<w:p>
  <w:pPr>
    <w:pStyle w:val="ListParagraph"/>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="1"/>
    </w:numPr>
    <w:spacing w:line="${ls}" w:lineRule="auto" w:after="${aft}"/>
    <w:ind w:left="${indL}" w:hanging="${hang}"/>
  </w:pPr>
  ${content}
</w:p>`;
  }).join("\n");
}

function hasTableData(headers, rows) {
  const validHeaders = (headers || []).filter(h => h && String(h).trim() && String(h).trim() !== "—");
  if (!validHeaders.length) return false;
  // Accept string (CSV blob), array of strings, or nested arrays
  let r = rows;
  if (typeof r === "string" && r.trim()) r = r.split("\n").map(s => s.trim()).filter(Boolean);
  if (!Array.isArray(r)) return false;
  const validRows = r.filter(row => {
    if (Array.isArray(row)) return row.some(c => c && String(c).trim() && String(c).trim() !== "—");
    if (typeof row === "string") return row.split(",").some(c => c.trim() && c.trim() !== "—");
    return false;
  });
  return validRows.length > 0;
}

function makeTableXml(headers, rows, docStyles) {
  // Safety: skip empty tables entirely
  if (!hasTableData(headers, rows)) return "";

  const ts      = (docStyles||DEFAULT_DOC_STYLES).table || DEFAULT_DOC_STYLES.table;
  const bs      = (docStyles||DEFAULT_DOC_STYLES).paragraph || (docStyles||DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const font    = ts.font    || bs.font || "Times New Roman";
  const szHp    = pt2hp(ts.size || bs.size || 11);
  const bodyCol = hexCol(ts.color    || bs.color || "#000000");
  const hdrBg   = hexCol(ts.headerBg    || "#1e3a8a");
  const hdrCol  = hexCol(ts.headerColor || "#ffffff");
  const altBg   = ts.rowAltBg   ? hexCol(ts.rowAltBg)   : "EFF6FF";
  const bdrCol  = ts.borderColor ? hexCol(ts.borderColor) : "374151";
  const ls      = ls2dxa(ts.lineSpacing || 1.15);
  const aft     = pt2dxa(4);

  const hArr = Array.isArray(headers)&&headers.length ? headers : ["Column 1","Column 2"];
  const n    = hArr.length;
  // Use percentage-based total width (5000 = 100% in OOXML fiftieths-of-percent)
  // Column widths in dxa for grid — still needed for tblGrid even with pct table
  const totalW = 9026;
  const colWidths = Array(n).fill(Math.floor(totalW / n));
  // Distribute remainder to last column to avoid rounding gaps
  const remainder = totalW - Math.floor(totalW / n) * n;
  colWidths[n - 1] += remainder;

  const gridCols = colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join("");
  // 115 twips (~0.08") padding on all sides — spacious but not loose
  const cellMar  = `<w:tcMar><w:top w:w="115" w:type="dxa"/><w:left w:w="115" w:type="dxa"/><w:bottom w:w="115" w:type="dxa"/><w:right w:w="115" w:type="dxa"/></w:tcMar>`;
  const borderXml= `<w:top w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:left w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:right w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:insideH w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:insideV w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/>`;
  const pPr      = `<w:pPr><w:spacing w:line="${ls}" w:lineRule="auto" w:after="60"/><w:jc w:val="left"/></w:pPr>`;
  const hRpr     = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:b/><w:bCs/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${hdrCol}"/></w:rPr>`;
  const bRpr     = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${bodyCol}"/></w:rPr>`;

  const makeCell = (text, rpr, w, fill) => {
    const cellText = text != null ? String(text).trim() : "";
    const shd = fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : "";
    return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:vAlign w:val="top"/>${shd}${cellMar}</w:tcPr><w:p>${pPr}<w:r>${rpr}<w:t>${xmlEsc(cellText)}</w:t></w:r></w:p></w:tc>`;
  };

  const hdrRow  = `<w:tr><w:trPr><w:tblHeader/><w:trHeight w:val="400" w:type="atLeast"/></w:trPr>${hArr.map((h,ci) => makeCell(h, hRpr, colWidths[ci], hdrBg)).join("")}</w:tr>`;
  
  let dataRows = "";
  // Bulletproof safety splitter: handles string blobs, CSV, nested arrays, quoted cells
  const cleanCell = v => String(v ?? "").trim().replace(/^["']|["']$/g, "").replace(/[\t\u00A0]/g, " ").trim();
  const safeRows = (() => {
    if (!rows) return [];
    let r = rows;
    // Coerce non-array: try JSON parse, then newline-split
    if (!Array.isArray(r)) {
      const s = typeof r === "string" ? r.trim() : "";
      if (!s) return [];
      try { const p = JSON.parse(s); r = Array.isArray(p) ? p : [p]; }
      catch (_) { r = s.split("\n").map(x => x.trim()).filter(Boolean); }
    }
    return r.map(row => {
      if (Array.isArray(row)) return row.map(cleanCell);
      if (typeof row === "string" && row.trim()) return row.split(",").map(cleanCell);
      return [];
    }).filter(row => row.some(c => c && c !== "—"));
  })();
  if (safeRows.length > 0) {
    dataRows = safeRows.map((row, ri) => {
      const shade = ri % 2 === 1 ? "EFF6FF" : "";
      const cells = [];
      for (let ci = 0; ci < n; ci++) {
        const cellVal = row[ci] != null ? String(row[ci]) : "";
        cells.push(makeCell(cellVal, bRpr, colWidths[ci], shade));
      }
      return `<w:tr><w:trPr><w:trHeight w:val="300" w:type="atLeast"/></w:trPr>${cells.join("")}</w:tr>`;
    }).join("\n");
  }

  return `<w:tbl>
  <w:tblPr>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblBorders>${borderXml}</w:tblBorders>
    <w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar>
  </w:tblPr>
  <w:tblGrid>${gridCols}</w:tblGrid>
  ${hdrRow}
  ${dataRows}
</w:tbl>`;
}

function makeColumnsXml(texts, numCols, docStyles) {
  const s      = (docStyles||DEFAULT_DOC_STYLES).paragraph || (docStyles||DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const font   = s.font || "Times New Roman";
  const szHp   = pt2hp(s.size);
  const col    = hexCol(s.color);
  const ls     = ls2dxa(s.lineSpacing||1.5);
  const aft    = pt2dxa(s.marginBottom||8);
  const jc     = wAlign(s.align||"justify");

  const totalW      = 9026;
  const gutter      = 120;
  const gutterTotal = gutter * (numCols - 1);
  const colW        = Math.floor((totalW - gutterTotal) / numCols);
  const lastColW    = totalW - gutterTotal - colW * (numCols - 1);
  const colWidths   = Array(numCols).fill(colW);
  colWidths[numCols - 1] = lastColW;

  const gridCols = colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join("");
  const pPr = `<w:pPr><w:pStyle w:val="ProfessionalBody"/><w:jc w:val="${jc}"/><w:spacing w:line="${ls}" w:lineRule="auto" w:after="${aft}"/></w:pPr>`;
  const rPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${col}"/></w:rPr>`;

  const makeCell = (textOrArr, w, isLast) => {
    // Normalise: accept string, array of strings, or nested array
    let paras;
    if (Array.isArray(textOrArr)) {
      paras = textOrArr.flatMap(v => Array.isArray(v) ? v.map(String) : [String(v ?? "")]).filter(Boolean);
    } else {
      paras = [String(textOrArr ?? "")];
    }
    if (!paras.length) paras = [""];
    const rightMar = isLast ? 0 : gutter;
    const content  = paras.map(t => `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(t)}</w:t></w:r></w:p>`).join("\n");
    return `<w:tc><w:tcPr>
      <w:tcW w:w="${w}" w:type="dxa"/>
      <w:vAlign w:val="top"/>
      <w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>
      <w:tcMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="${rightMar}" w:type="dxa"/></w:tcMar>
    </w:tcPr>${content}</w:tc>`;
  };

  const arr   = Array.isArray(texts) ? texts : Array(numCols).fill("");
  const cells = Array(numCols).fill(null).map((_,i) => makeCell(arr[i]||"", colWidths[i], i===numCols-1)).join("\n");

  return `<w:tbl>
  <w:tblPr>
    <w:tblW w:w="${totalW}" w:type="dxa"/>
    <w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>
    <w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar>
  </w:tblPr>
  <w:tblGrid>${gridCols}</w:tblGrid>
  <w:tr>${cells}</w:tr>
</w:tbl>`;
}

function makeHyperlinkXml(text, url, rId, bold, italic, docStyles) {
  const s    = (docStyles||DEFAULT_DOC_STYLES).paragraph || (docStyles||DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const font = s.font || "Times New Roman";
  const szHp = pt2hp(s.size);
  const ls   = ls2dxa(s.lineSpacing||1.5);
  const aft  = pt2dxa(s.marginBottom||8);
  const b    = bold   ? "<w:b/><w:bCs/>" : "";
  const i    = italic ? "<w:i/><w:iCs/>" : "";
  const pPr  = `<w:pPr><w:spacing w:line="${ls}" w:lineRule="auto" w:after="${aft}"/></w:pPr>`;
  const rPr  = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>${b}${i}<w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr>`;
  const displayText = xmlEsc(text || url || "Link");
  if (!rId) return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${displayText}</w:t></w:r></w:p>`;
  return `<w:p>${pPr}<w:hyperlink r:id="${rId}" w:history="1"><w:r>${rPr}<w:t xml:space="preserve">${displayText}</w:t></w:r></w:hyperlink></w:p>`;
}

function makeImagePlaceholderXml() {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="160"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:left w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:bottom w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:right w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:pPr><w:r><w:rPr><w:color w:val="9CA3AF"/><w:sz w:val="22"/></w:rPr><w:t>[ Image Placeholder — replace in Word ]</w:t></w:r></w:p>`;
}

function makeImageXml(rId, widthEmu, heightEmu, picId) {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="80"/></w:pPr>
<w:r><w:drawing>
<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
  <wp:effectExtent l="0" t="0" r="0" b="0"/>
  <wp:docPr id="${picId}" name="Image${picId}"/>
  <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
  <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
      <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:nvPicPr>
          <pic:cNvPr id="${picId}" name="Image${picId}"/>
          <pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr>
        </pic:nvPicPr>
        <pic:blipFill>
          <a:blip r:embed="${rId}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </pic:blipFill>
        <pic:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </pic:spPr>
      </pic:pic>
    </a:graphicData>
  </a:graphic>
</wp:inline>
</w:drawing></w:r></w:p>`;
}

function buildNumberingXml(bulletCfg) {
  const cfg = bulletCfg || DEFAULT_DOC_STYLES.bullets;
  const def = BULLET_STYLES[cfg.styleName] || BULLET_STYLES["Disc (•)"];
  const indL = cfg.indentLeft || 720;
  const hang = cfg.hanging    || 360;
  const subNames = ["Circle (○)", "Square (▪)", "Dash (–)", "Disc (•)"];
  const subName  = subNames.find(n => n !== cfg.styleName) || "Circle (○)";
  const sub = BULLET_STYLES[subName];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="${def.numFmt}"/>
      <w:lvlText w:val="${def.lvlText}"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:ind w:left="${indL}" w:hanging="${hang}"/>
      </w:pPr>
      <w:rPr><w:rFonts w:ascii="${def.font}" w:hAnsi="${def.font}" w:cs="${def.font}"/></w:rPr>
    </w:lvl>
    <w:lvl w:ilvl="1">
      <w:start w:val="1"/>
      <w:numFmt w:val="${sub.numFmt}"/>
      <w:lvlText w:val="${sub.lvlText}"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:ind w:left="${indL + 360}" w:hanging="${hang}"/>
      </w:pPr>
      <w:rPr><w:rFonts w:ascii="${sub.font}" w:hAnsi="${sub.font}" w:cs="${sub.font}"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;
}

const CONTENT_WIDTH_EMU = 5731510; // A4 content width in EMU (9026 twips × 635)

async function buildDocx(elements, docStyles) {
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error("JSZip not loaded yet.");
  const styles = docStyles || DEFAULT_DOC_STYLES;

  // Collect media elements for relationship building
  const imageEls     = elements.filter(el => el.type === "image" && el.imageData);
  const hyperlinkEls = elements.filter(el => el.type === "hyperlink" && el.url);

  let nextRId = 3; // rId1=styles, rId2=numbering
  const imgRIdMap = new Map();
  imageEls.forEach(el => imgRIdMap.set(el.id, `rId${nextRId++}`));
  const hlRIdMap = new Map();
  hyperlinkEls.forEach(el => hlRIdMap.set(el.id, `rId${nextRId++}`));

  const paras = [];
  let picIdCounter = 1;

  for (const el of elements) {
    if (el.type === "body" || el.type === "paragraph") {
      // Fix: always iterate array; detect & handle accidentally stringified JSON arrays
      let texts = Array.isArray(el.texts) ? el.texts : [el.text || ""];
      texts = texts.flatMap(t => {
        // Coerce non-strings (e.g. accidentally nested arrays or objects)
        if (Array.isArray(t)) return t.map(v => String(v || "")).filter(Boolean);
        const s = String(t ?? "");
        if (s.trimStart().startsWith("[")) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
          } catch(_) {}
        }
        return [s];
      });
      texts.forEach(t => paras.push(makeRichParaXml(String(t), "paragraph", styles)));
    } else if (el.type === "bullets") {
      const items = Array.isArray(el.items) ? el.items : [el.text || "Bullet item"];
      paras.push(makeBulletXml(items, styles));
    } else if (el.type === "hr") {
      paras.push(makeHrXml());
    } else if (el.type === "table") {
      if (hasTableData(el.headers || [], el.rows || [])) {
        paras.push(makeTableXml(el.headers || [], el.rows || [], styles));
      }
    } else if (el.type === "columns") {
      paras.push(makeColumnsXml(Array.isArray(el.texts) ? el.texts : [], el.cols || 2, styles));
    } else if (el.type === "hyperlink") {
      const rId = hlRIdMap.get(el.id) || null;
      paras.push(makeHyperlinkXml(el.text || "", el.url || "", rId, el.bold, el.italic, styles));
    } else if (el.type === "image") {
      if (el.imageData) {
        const rId      = imgRIdMap.get(el.id);
        const pct      = (el.width || 80) / 100;
        const widthEmu = Math.round(CONTENT_WIDTH_EMU * pct);
        const ratio    = (el.imgH || 9) / (el.imgW || 16);
        const heightEmu = Math.round(widthEmu * ratio);
        paras.push(makeImageXml(rId, widthEmu, heightEmu, picIdCounter++));
      } else {
        paras.push(makeImagePlaceholderXml());
      }
      if (el.caption && el.caption.trim()) {
        const capFont = (styles.paragraph || styles.body)?.font || "Times New Roman";
        const capSz   = pt2hp(((styles.paragraph || styles.body)?.size || 12) - 1);
        paras.push(`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${capFont}" w:hAnsi="${capFont}"/><w:i/><w:sz w:val="${capSz}"/><w:color w:val="4B5563"/></w:rPr><w:t xml:space="preserve">${xmlEsc(el.caption)}</w:t></w:r></w:p>`);
      }
    } else {
      // Handle texts array (e.g. body blocks stored with texts instead of text)
      if (Array.isArray(el.texts) && el.texts.length > 0) {
        el.texts.forEach(t => paras.push(makeRichParaXml(String(t ?? ""), el.type, styles)));
      } else {
        paras.push(makeRichParaXml(el.text || "", el.type, styles));
      }
    }
  }

  // Page margins: convert inches → twips (1 inch = 1440 twips)
  // Coerce to float — number inputs can return strings
  const pm = styles.pageMargins || DEFAULT_DOC_STYLES.pageMargins;
  const pmTop    = Math.round((parseFloat(pm.top)    || 1.0) * 1440);
  const pmBottom = Math.round((parseFloat(pm.bottom) || 1.0) * 1440);
  const pmLeft   = Math.round((parseFloat(pm.left)   || 1.0) * 1440);
  const pmRight  = Math.round((parseFloat(pm.right)  || 1.0) * 1440);

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
${paras.join("\n")}
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>
  <w:pgMar w:top="${pmTop}" w:right="${pmRight}" w:bottom="${pmBottom}" w:left="${pmLeft}" w:header="709" w:footer="709" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`;

  const paraS  = styles.paragraph || styles.body || DEFAULT_DOC_STYLES.paragraph;
  const bodyFont=paraS.font||"Times New Roman";
  const bodySz  =pt2hp(paraS.size||12);
  const bodyCol =hexCol(paraS.color||"#000000");
  const bodyLs  =ls2dxa(paraS.lineSpacing||1.5);
  const bodyAft =pt2dxa(paraS.marginBottom||8);
  const bodyJc  =wAlign(paraS.align||"justify");

  const h1s  = (docStyles||DEFAULT_DOC_STYLES).h1 || DEFAULT_DOC_STYLES.h1;
  const h2s  = (docStyles||DEFAULT_DOC_STYLES).h2 || DEFAULT_DOC_STYLES.h2;
  const titS = (docStyles||DEFAULT_DOC_STYLES).title || DEFAULT_DOC_STYLES.title;

  const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr>
      <w:spacing w:line="360" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr></w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:line="${bodyLs}" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ProfessionalBody">
    <w:name w:val="ProfessionalBody"/>
    <w:pPr>
      <w:jc w:val="${bodyJc}"/>
      <w:spacing w:line="360" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="34"/>
    <w:qFormat/>
    <w:pPr>
      <w:ind w:left="${(docStyles||DEFAULT_DOC_STYLES).bullets?.indentLeft || 720}"/>
      <w:contextualSpacing/>
      <w:spacing w:line="${ls2dxa((docStyles||DEFAULT_DOC_STYLES).bullets?.lineSpacing || paraS.lineSpacing || 1.5)}" w:lineRule="auto" w:after="${pt2dxa((docStyles||DEFAULT_DOC_STYLES).bullets?.itemSpacingAfter ?? 6)}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:unhideWhenUsed/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="${pt2dxa(h1s.marginTop||16)}" w:after="${pt2dxa(h1s.marginBottom||6)}" w:line="276" w:lineRule="auto"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${h1s.font||"Arial"}" w:hAnsi="${h1s.font||"Arial"}" w:cs="${h1s.font||"Arial"}"/>
      ${h1s.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(h1s.size||18)}"/><w:szCs w:val="${pt2hp(h1s.size||18)}"/>
      <w:color w:val="${hexCol(h1s.color||"#000000")}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:unhideWhenUsed/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="${pt2dxa(h2s.marginTop||10)}" w:after="${pt2dxa(h2s.marginBottom||4)}" w:line="276" w:lineRule="auto"/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${h2s.font||"Arial"}" w:hAnsi="${h2s.font||"Arial"}" w:cs="${h2s.font||"Arial"}"/>
      ${h2s.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(h2s.size||14)}"/><w:szCs w:val="${pt2hp(h2s.size||14)}"/>
      <w:color w:val="${hexCol(h2s.color||"#000000")}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="10"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="${pt2dxa(titS.marginTop||0)}" w:after="${pt2dxa(titS.marginBottom||12)}" w:line="276" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${titS.font||"Arial"}" w:hAnsi="${titS.font||"Arial"}" w:cs="${titS.font||"Arial"}"/>
      ${titS.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(titS.size||24)}"/><w:szCs w:val="${pt2hp(titS.size||24)}"/>
      <w:color w:val="${hexCol(titS.color||"#000000")}"/>
    </w:rPr>
  </w:style>
</w:styles>`;

  // Build dynamic relationships
  const imgRels = imageEls.map(el => {
    const rId = imgRIdMap.get(el.id);
    const ext = el.imageType || "png";
    return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${el.id}.${ext}"/>`;
  }).join("\n  ");

  const hlRels = hyperlinkEls.map(el => {
    const rId = hlRIdMap.get(el.id);
    return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${attrEsc(el.url)}" TargetMode="External"/>`;
  }).join("\n  ");

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  ${imgRels}${hlRels}
</Relationships>`;

  const hasImages = imageEls.length > 0;
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImages ? '<Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="jpeg" ContentType="image/jpeg"/>' : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", docRelsXml);
  zip.file("word/document.xml", docXml);
  zip.file("word/styles.xml", stylesXml);
  zip.file("word/numbering.xml", buildNumberingXml((docStyles||DEFAULT_DOC_STYLES).bullets));

  // Embed image files as base64
  for (const el of imageEls) {
    const ext = el.imageType || "png";
    const b64 = el.imageData.includes(",") ? el.imageData.split(",")[1] : el.imageData;
    zip.file(`word/media/${el.id}.${ext}`, b64, { base64: true });
  }

  return zip.generateAsync({ type:"uint8array", mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression:"DEFLATE", compressionOptions:{level:6} });
}

/* ════════════════════════════════════════════════
   OLLAMA — STREAMING
════════════════════════════════════════════════ */
async function* streamOllama(baseUrl, prompt, opts = {}) {
  const url = (baseUrl || "http://localhost:11434").replace(/\/$/, "");
  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model || "qwen2.5:7b",
      messages: [{ role: "user", content: prompt }],
      stream: true,
      options: {
        num_ctx:     opts.num_ctx     || 8192,
        num_predict: opts.num_predict || 6000,
        temperature: opts.temperature ?? 0.6,
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status} — Run: OLLAMA_ORIGINS=* ollama serve\n${t.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value, { stream: true }).split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line);
        if (evt.message?.content) yield evt.message.content;
        if (evt.done) return;
      } catch (_) {}
    }
  }
}

/* ════════════════════════════════════════════════
   DOCX PREVIEW MODAL
════════════════════════════════════════════════ */
function DocPreviewModal({ uint8, title, onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const run = async () => {
      if (!window.docx) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/docx-preview@0.3.6/dist/docx-preview.min.js";
          s.onload = res;
          s.onerror = () => rej(new Error("Failed to load docx-preview"));
          document.head.appendChild(s);
        });
      }
      if (!containerRef.current) return;
      try {
        if (!document.getElementById("dr-preview-css")) {
          const st = document.createElement("style");
          st.id = "dr-preview-css";
          st.textContent = [
            `.dr-modal-wrap * { box-sizing: border-box; margin: 0; padding: 0; }`,
            `.dr-preview { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: #f1f5f9; min-height: 100%; }`,
            `.dr-preview section.docx { width: 100% !important; max-width: 800px; margin: 0 auto 20px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important; border-radius: 4px; background: #fff; }`,
          ].join("\n");
          document.head.appendChild(st);
        }
        const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        await window.docx.renderAsync(blob, containerRef.current, null, {
          className: "dr-preview",
          inWrapper: true,
          ignoreWidth: true,
          ignoreHeight: false,
          breakPages: true,
          useBase64URL: true,
        });
      } catch (e) {
        setError("Preview failed: " + e.message);
      }
      setLoading(false);
    };
    run();
  }, [uint8]);

  const modal = (
    <div
      className="dr-modal-wrap"
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        position: "relative",
        width: "100%", maxWidth: "860px",
        height: "92vh",
        display: "flex", flexDirection: "column",
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>◈</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1 }}>Document Preview</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 3, maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1.5px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 20, lineHeight: 1,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >&times;</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f1f5f9" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #dbeafe", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
              <div style={{ color: "#475569", fontWeight: 700, fontSize: 14 }}>Rendering document…</div>
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
            </div>
          )}
          {error && (
            <div style={{ margin: "40px auto", maxWidth: 480, textAlign: "center", color: "#dc2626", padding: 24, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Failed to render</div>
              <div style={{ fontSize: 13 }}>{error}</div>
            </div>
          )}
          <div ref={containerRef} style={{ display: loading ? "none" : "block", width: "100%" }} />
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Press Esc or click outside to close</span>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: 10,
              background: "#1e293b", color: "#fff",
              border: "none", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
            }}
          >Close ×</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}


/* ════════════════════════════════════════════════
   STYLE EDITOR
════════════════════════════════════════════════ */
const FONTS = ["Arial","Times New Roman","Georgia","Calibri","Verdana","Garamond","Trebuchet MS","Palatino Linotype","Helvetica","Tahoma"];
const ALIGNS = [{ v:"left",l:"Left" },{ v:"center",l:"Center" },{ v:"right",l:"Right" },{ v:"justify",l:"Justify" }];
const SPACINGS = [{ v:1.0,l:"1.0×" },{ v:1.15,l:"1.15×" },{ v:1.5,l:"1.5×" },{ v:2.0,l:"2.0×" }];

const STYLE_TABS = [
  { key:"title",        label:"Title",       dot:C.blue900 },
  { key:"h1",           label:"Heading 1",   dot:C.blue700 },
  { key:"h2",           label:"Heading 2",   dot:C.blue500 },
  { key:"paragraph",    label:"Paragraph",   dot:C.gray600 },
  { key:"bullets",      label:"Bullets",     dot:C.gray700 },
  { key:"table",        label:"Table",       dot:C.teal    },
  { key:"pageMargins",  label:"Margins",     dot:C.purple  },
];

const TYPE_ACCENT_COL = { title:C.blue900, h1:C.blue700, h2:C.blue500, paragraph:C.gray600, body:C.gray600, table:C.teal };

/* small reusable field-label */
const FL = ({ children }) => (
  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{children}</div>
);

/* color row: swatch + hex input */
const ColorRow = ({ label, value, onChange }) => (
  <div>
    <FL>{label}</FL>
    <div className="flex gap-2 items-center">
      <input type="color" value={value||"#000000"} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 border border-slate-200 rounded-lg cursor-pointer p-0.5 shrink-0 bg-white" />
      <input value={value||""} onChange={e => onChange(e.target.value)} placeholder="#000000"
        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
    </div>
  </div>
);

function StyleEditor({ docStyles, setDocStyles }) {
  const [open, setOpen] = useState(false);
  const [tab,  setTab]  = useState("paragraph");

  const set  = (type, key, val) => setDocStyles(p => ({ ...p, [type]:{ ...p[type], [key]:val } }));
  const reset = (type) => setDocStyles(p => ({ ...p, [type]:{ ...DEFAULT_DOC_STYLES[type] } }));

  const s  = docStyles[tab] || {};
  const iStClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  /* live preview text */
  const previewText = tab==="title" ? "Document Title — Preview" : tab==="h1" ? "1. Major Section Heading" : tab==="h2" ? "1.1 Sub-section Heading" : tab==="table" ? null : "Body paragraph text appears here. Font, size, colour and spacing all apply.";

  /* table preview */
  const TablePreview = () => {
    const ts = docStyles.table || DEFAULT_DOC_STYLES.table;
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm mt-3">
        <table className="w-full border-collapse" style={{ fontFamily: ts.font||"Times New Roman", fontSize: ts.size||11 }}>
          <thead>
            <tr>{["Header 1","Header 2","Header 3"].map((h,i) => (
              <th key={i} style={{ background: ts.headerBg||"#1e3a8a", color: ts.headerColor||"#ffffff", padding:"8px 12px", border:`1px solid ${ts.borderColor||"#374151"}`, fontWeight:700, textAlign:"left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[["Row A value","Detail text","123"],["Row B value","Another detail","456"]].map((row,ri) => (
              <tr key={ri} style={{ background: ri%2===1 ? (ts.rowAltBg||"#eff6ff") : "transparent" }}>
                {row.map((cell,ci) => (
                  <td key={ci} style={{ padding:"8px 12px", border:`1px solid ${ts.borderColor||"#374151"}`, color: ts.color||"#000000" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="overflow-hidden bg-white rounded-2xl">
      {/* ── Toggle header ── */}
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border-none cursor-pointer text-left transition-colors outline-none focus:ring-0 ${
          open ? 'bg-slate-900' : 'bg-slate-50 hover:bg-slate-100'
        }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`text-base shrink-0 ${open ? 'text-indigo-400' : 'text-indigo-600'}`}>⚙️</span>
          <div className="min-w-0">
            <div className={`font-bold text-sm ${open ? 'text-white' : 'text-slate-900'}`}>Global Style Settings</div>
            <div className={`text-[10px] mt-0.5 truncate font-medium ${open ? 'text-slate-400' : 'text-slate-500'}`}>Font · Size · Color · Background · Spacing · Alignment — for all block types</div>
          </div>
        </div>
        <span className={`text-xs shrink-0 ml-2 ${open ? 'text-slate-500' : 'text-slate-400'}`}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-white">
          {/* ── Tab bar ── */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide py-1">
            {STYLE_TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 min-w-[85px] px-3 py-2.5 border-none bg-transparent cursor-pointer text-xs font-bold whitespace-nowrap transition-all border-b-[3px] ${tab===t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle shadow-inner shadow-black/20" style={{ background: t.dot }} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ══ TEXT / HEADING / PARAGRAPH tabs ══ */}
            {tab !== "table" && tab !== "bullets" && tab !== "pageMargins" && (
              <>
                {/* Row 1: Font + Size */}
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_100px] gap-4 mb-4">
                  <div>
                    <FL>Font Family</FL>
                    <select value={s.font||"Arial"} onChange={e => set(tab,"font",e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Size (pt)</FL>
                    <input type="number" min={6} max={96} value={s.size||12} onChange={e => set(tab,"size",Number(e.target.value))} className={iStClass}/>
                  </div>
                </div>

                {/* Row 2: Text Color + Background Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Text Color"       value={s.color||"#000000"}  onChange={v => set(tab,"color",v)}/>
                  <ColorRow label="Background Color" value={s.bgColor||""}       onChange={v => set(tab,"bgColor",v)}/>
                </div>

                {/* Row 3: Alignment + Line Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Alignment</FL>
                    <select value={s.align||"left"} onChange={e => set(tab,"align",e.target.value)} className={iStClass}>
                      {ALIGNS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Line Spacing</FL>
                    <select value={s.lineSpacing||1.5} onChange={e => set(tab,"lineSpacing",Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Space Before + Space After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Space Before (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginTop||0} onChange={e => set(tab,"marginTop",Number(e.target.value))} className={iStClass}/>
                  </div>
                  <div>
                    <FL>Space After (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginBottom||8} onChange={e => set(tab,"marginBottom",Number(e.target.value))} className={iStClass}/>
                  </div>
                </div>

                {/* Row 5: Bold + Italic toggles */}
                <div className="flex gap-4 mb-5">
                  {[["Bold","bold"],["Italic","italic"]].map(([lb,key]) => (
                    <button key={key} onClick={() => set(tab,key,!s[key])}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-all focus:outline-none ${s[key] ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      style={{ fontStyle: key==="italic" ? "italic" : "normal" }}>
                      {lb} {s[key] ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                  <div style={{
                    fontFamily:s.font, fontSize:s.size, color:s.color, textAlign:s.align,
                    fontWeight: s.bold ? "bold" : "normal", fontStyle: s.italic ? "italic" : "normal",
                    lineHeight:s.lineSpacing, background: s.bgColor||"transparent", padding: s.bgColor ? "6px 8px" : 0, borderRadius:4,
                  }}>
                    {previewText}
                  </div>
                </div>
              </>
            )}

            {/* ══ BULLETS tab ══ */}
            {tab === "bullets" && (() => {
              const bs = docStyles.bullets || DEFAULT_DOC_STYLES.bullets;
              const setBullet = (key, val) => setDocStyles(p => ({ ...p, bullets: { ...(p.bullets || DEFAULT_DOC_STYLES.bullets), [key]: val } }));
              const previewSymbol = (BULLET_STYLES[bs.styleName] || BULLET_STYLES["Disc (•)"]).lvlText
                .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
              return (
                <>
                  {/* Bullet Style */}
                  <div className="mb-4">
                    <FL>Bullet Style</FL>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BULLET_STYLE_NAMES.map(name => {
                        const sym = (BULLET_STYLES[name].lvlText||"").replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex,16)));
                        const active = bs.styleName === name;
                        return (
                          <button key={name} onClick={() => setBullet("styleName", name)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-black shadow-sm' : 'border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50'}`}>
                            <span className={`text-xl w-6 text-center ${active ? 'text-indigo-600' : 'text-slate-500'}`}>{sym}</span>
                            <span>{name}</span>
                            {active && <span className="ml-auto text-indigo-600 font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indent + Hanging */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <FL>Indent Left (twips)</FL>
                      <input type="number" min={0} max={2880} step={120} value={bs.indentLeft||720}
                        onChange={e => setBullet("indentLeft", Number(e.target.value))} className={iStClass}/>
                      <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Default: 720 (½ inch)</div>
                    </div>
                    <div>
                      <FL>Hanging Indent (twips)</FL>
                      <input type="number" min={0} max={1440} step={120} value={bs.hanging||360}
                        onChange={e => setBullet("hanging", Number(e.target.value))} className={iStClass}/>
                      <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Default: 360 (¼ inch)</div>
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <FL>Space After Each Item (pt)</FL>
                      <input type="number" min={0} max={60} value={bs.itemSpacingAfter??6}
                        onChange={e => setBullet("itemSpacingAfter", Number(e.target.value))} className={iStClass}/>
                    </div>
                    <div>
                      <FL>Line Spacing</FL>
                      <select value={bs.lineSpacing||1.5} onChange={e => setBullet("lineSpacing", Number(e.target.value))} className={iStClass}>
                        {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                    {["First bullet point", "Second bullet point", "Third bullet point"].map((text, i) => (
                      <div key={i} style={{ display:"flex", gap:10, marginBottom: bs.itemSpacingAfter ?? 6, lineHeight: bs.lineSpacing || 1.5, fontFamily: (docStyles.paragraph||docStyles.body)?.font || "Times New Roman", fontSize: (docStyles.paragraph||docStyles.body)?.size || 12, color: (docStyles.paragraph||docStyles.body)?.color || "#000000", paddingLeft: Math.round((bs.indentLeft||720)/20) }}>
                        <span style={{ flexShrink:0, minWidth:16 }}>{previewSymbol}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* ══ TABLE tab ══ */}
            {tab === "table" && (
              <>
                {/* Font + Size */}
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_100px] gap-4 mb-4">
                  <div>
                    <FL>Font Family</FL>
                    <select value={s.font||"Times New Roman"} onChange={e => set("table","font",e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Font Size</FL>
                    <input type="number" min={6} max={24} value={s.size||11} onChange={e => set("table","size",Number(e.target.value))} className={iStClass}/>
                  </div>
                </div>

                {/* Header BG + Header Text Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Header Background" value={s.headerBg||"#1e3a8a"}    onChange={v => set("table","headerBg",v)}/>
                  <ColorRow label="Header Text Color" value={s.headerColor||"#ffffff"} onChange={v => set("table","headerColor",v)}/>
                </div>

                {/* Alt row BG + Body text color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Alt Row Background" value={s.rowAltBg||"#eff6ff"}  onChange={v => set("table","rowAltBg",v)}/>
                  <ColorRow label="Body Text Color"    value={s.color||"#000000"}      onChange={v => set("table","color",v)}/>
                </div>

                {/* Border color + Line spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <ColorRow label="Border Color" value={s.borderColor||"#374151"} onChange={v => set("table","borderColor",v)}/>
                  <div>
                    <FL>Row Spacing</FL>
                    <select value={s.lineSpacing||1.15} onChange={e => set("table","lineSpacing",Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Table live preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                  <TablePreview/>
                </div>
              </>
            )}

            {/* ══ PAGE MARGINS tab ══ */}
            {tab === "pageMargins" && (() => {
              const pm = docStyles.pageMargins || DEFAULT_DOC_STYLES.pageMargins;
              const setMargin = (key, val) => setDocStyles(p => ({ ...p, pageMargins: { ...(p.pageMargins || DEFAULT_DOC_STYLES.pageMargins), [key]: val } }));
              const inchInput = (label, key) => (
                <div>
                  <FL>{label} (inches)</FL>
                  <input type="number" min={0} max={6} step={0.1}
                    value={pm[key] ?? 1.0}
                    onChange={e => setMargin(key, parseFloat(e.target.value) || 0)}
                    className={iStClass}/>
                </div>
              );
              // Preset buttons matching Word's margin presets
              const PRESETS = [
                { label:"Normal",  vals:{ top:1.0,  bottom:1.0,  left:1.0,  right:1.0  } },
                { label:"Narrow",  vals:{ top:0.5,  bottom:0.5,  left:0.5,  right:0.5  } },
                { label:"Moderate",vals:{ top:1.0,  bottom:1.0,  left:0.75, right:0.75 } },
                { label:"Wide",    vals:{ top:1.0,  bottom:1.0,  left:2.0,  right:2.0  } },
              ];
              const isActive = (vals) => ["top","bottom","left","right"].every(k => Math.abs((pm[k]??1.0) - vals[k]) < 0.01);
              return (
                <>
                  {/* Presets row */}
                  <div className="mb-5">
                    <FL>Margin Presets</FL>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PRESETS.map(p => {
                        const active = isActive(p.vals);
                        return (
                          <button key={p.label}
                            onClick={() => setDocStyles(prev => ({ ...prev, pageMargins: { ...p.vals } }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                            <div className="font-bold text-sm mb-1">{p.label}</div>
                            <div className={`text-[10px] font-medium tracking-wide ${active ? 'text-indigo-500' : 'text-slate-400'}`}>
                              T:{p.vals.top}" L:{p.vals.left}"
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom margin inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {inchInput("Top", "top")}
                    {inchInput("Bottom", "bottom")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    {inchInput("Left", "left")}
                    {inchInput("Right", "right")}
                  </div>

                  {/* Visual margin preview */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Page Preview</div>
                    <div className="flex justify-center">
                      {/* A4 page mock */}
                      <div className="relative w-[120px] h-[170px] bg-white border border-slate-200 rounded-md shadow-md">
                        {/* Margin guides */}
                        <div style={{
                          position:"absolute",
                          top:`${(pm.top??1)/11*100}%`,
                          bottom:`${(pm.bottom??1)/11*100}%`,
                          left:`${(pm.left??1)/8.5*100}%`,
                          right:`${(pm.right??1)/8.5*100}%`,
                          border:`1.5px dashed #818cf8`,
                          borderRadius:2,
                        }}/>
                        {/* Label badges */}
                        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">T:{pm.top??1}"</div>
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">B:{pm.bottom??1}"</div>
                        <div className="absolute left-[2px] top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">L:{pm.left??1}"</div>
                        <div className="absolute right-[2px] top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">R:{pm.right??1}"</div>
                        {/* Content lines */}
                        {[0,1,2,3,4].map(i => (
                          <div key={i} style={{
                            position:"absolute",
                            top:`calc(${(pm.top??1)/11*100}% + ${12+i*14}px)`,
                            left:`calc(${(pm.left??1)/8.5*100}% + 4px)`,
                            right:`calc(${(pm.right??1)/8.5*100}% + 4px)`,
                            height:2, background:"#cbd5e1", borderRadius:1
                          }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Reset button */}
            <div className="flex justify-end pt-2">
              {tab !== "pageMargins" ? (
                <button onClick={() => reset(tab)}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer text-xs font-bold transition-colors shadow-sm">
                  ↺ Reset {STYLE_TABS.find(t=>t.key===tab)?.label} to defaults
                </button>
              ) : (
                <button onClick={() => setDocStyles(p => ({ ...p, pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins } }))}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer text-xs font-bold transition-colors shadow-sm">
                  ↺ Reset Margins to Normal (1")
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
/* ════════════════════════════════════════════════
   TEMPLATE BLOCK (light editor for post-gen tweaks)
════════════════════════════════════════════════ */
const TYPE_LABEL = { title: "Title", h1: "H1", h2: "H2", paragraph: "Paragraph", body: "Paragraph", bullets: "Bullets", hr: "Divider", table: "Table", columns: "Columns" };
const TYPE_BADGE = { title: { bg: C.blue900, text: C.white }, h1: { bg: C.blue700, text: C.white }, h2: { bg: C.blue100, text: C.blue800 }, paragraph: { bg: C.gray200, text: C.gray700 }, body: { bg: C.gray200, text: C.gray700 }, bullets: { bg: C.gray700, text: C.white }, hr: { bg: C.gray300, text: C.gray700 }, table: { bg: C.blue800, text: C.white }, columns: { bg: C.blue600, text: C.white } };
const TYPE_BG = { title: C.blue900, h1: C.blue50, h2: C.bgMuted, paragraph: C.gray100, body: C.gray100, bullets: C.gray100, hr: C.gray100, table: C.blue50, columns: C.blue50 };

function TemplateBlock({ el, idx, total, onUpdate, onUpdateBatch, onRemove, onMoveUp, onMoveDown, ollamaUrl, ollamaModel }) {
  const badge = TYPE_BADGE[el.type] || TYPE_BADGE.paragraph;
  const bgColor = TYPE_BG[el.type] || C.gray100;
  const isTitle = el.type === "title", isHeading = el.type === "h1" || el.type === "h2";
  const isBody = el.type === "body" || el.type === "paragraph", isBullets = el.type === "bullets";
  const isHr = el.type === "hr", isTable = el.type === "table", isColumns = el.type === "columns";

  const [aiOpen,   setAiOpen]   = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,  setAiError]  = useState("");

  const inpClass = "w-full border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400";
  const badgeClasses = {
    title: "bg-indigo-600 text-white", h1: "bg-slate-800 text-white",
    hr: "bg-slate-200 text-slate-500", default: "bg-slate-100 text-slate-600"
  };
  const getBadgeStyle = (t) => badgeClasses[t] || badgeClasses.default;

  // Safety: hide table blocks with no real data on the review page
  if (isTable && !hasTableData(el.headers || [], el.rows || [])) return null;

  /* ── current content snapshot for AI context ── */
  const currentContentStr = () => {
    if (isBody)    return (el.texts || []).join("\n\n");
    if (isBullets) return (el.items || []).join("\n");
    if (isTable)   return `Headers: ${(el.headers||[]).join(", ")}\nRows:\n${(el.rows||[]).map(r=>r.join(" | ")).join("\n")}`;
    if (isColumns) return (el.texts || []).join("\n---\n");
    return el.text || "";
  };

  /* ── AI edit handler ── */
  const runAiEdit = async () => {
    if (!aiPrompt.trim()) { setAiError("Enter a prompt."); return; }
    setAiError(""); setAiLoading(true);
    try {
      const blockType = TYPE_LABEL[el.type] || el.type;
      const sectionTitle = el.text || (isBody && el.texts?.[0]?.slice(0,60)) || blockType;
      const content = currentContentStr();
      const instruction = aiPrompt.trim();

      /* ── shared formatting reference ── */
      const fmtRef = `Inline formatting you may use (only where it genuinely improves clarity):
- **bold** → key terms, critical concepts, important phrases (2–4 per paragraph max)
- _italic_ → titles of works, technical jargon, subtle emphasis (use sparingly)
- [link text](https://url) → hyperlinks only when a real relevant URL fits naturally
- Never bold or italic random words — only where it meaningfully helps the reader`;

      /* ── detect intent to guide preservation rules ── */
      const isAddIntent     = /(add|append|include|insert|more|extra|additional|another|\+)/i.test(instruction);
      const isReplaceIntent = /(replace|rewrite|redo|regenerate|change all|completely|from scratch)/i.test(instruction);
      const preserveNote    = isAddIntent && !isReplaceIntent
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
        prompt = `You are a professional editor working on a ${el.cols||2}-column layout in a document.

Section topic: "${sectionTitle}"

Current column content:
${content}

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}
- Each column must contain full, readable prose — not just a heading or a single sentence
- Maintain the ${el.cols||2}-column structure

Return ONLY a valid JSON array with exactly ${el.cols||2} strings (no markdown fences, no extra text):
["full column 1 text here","full column 2 text here"]
JSON:`;
      }

      const raw = await callOllama(ollamaUrl, prompt, { num_predict: 2000, temperature: 0.65 });

      /* parse & apply */
      if (isTitle || isHeading) {
        onUpdate("text", raw.replace(/^["']|["']$/g,"").trim());
      } else if (isBody) {
        const paras = raw.split(/\n\s*\n/).map(p=>p.replace(/\n/g," ").trim()).filter(p=>p.length>10);
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
        } catch(_) {
          const lines = raw.split("\n").map(l=>l.replace(/^[-•*\d.]+\s*/,"").trim()).filter(l=>l.length>5);
          onUpdate("items", lines.length ? lines : (el.items||[]));
        }
      } else if (isTable) {
        try {
          const obj = safeParseJSON(raw);
          if (obj && obj.headers) onUpdateBatch({ headers: obj.headers, rows: obj.rows || [] });
          else throw new Error("no headers");
        } catch(_) { setAiError("AI returned invalid table JSON. Try again."); }
      } else if (isColumns) {
        try {
          const arr = safeParseJSON(raw);
          if (Array.isArray(arr)) onUpdate("texts", arr.map(String));
          else throw new Error("not array");
        } catch(_) { setAiError("AI returned invalid columns JSON. Try again."); }
      }

      setAiOpen(false); setAiPrompt("");
    } catch(e) {
      setAiError(e.message || "AI edit failed.");
    }
    setAiLoading(false);
  };

  return (
    <div className="mb-5 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* ── Header row ── */}
      <div className={`flex items-center gap-3 px-5 py-3.5 ${isTitle ? 'bg-indigo-50/60' : 'bg-slate-50/80'} ${!isHr ? 'border-b border-slate-100' : ''}`}>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 font-mono ${getBadgeStyle(el.type)}`}>
          {TYPE_LABEL[el.type] || el.type}
        </span>
        
        {(isTitle || isHeading || isBody) && (
          <input value={el.text || ""} onChange={e => onUpdate("text", e.target.value)}
            placeholder={isBody ? "Body topic hint…" : "Heading text…"}
            className={`flex-1 bg-transparent outline-none ${isTitle ? 'text-lg font-bold text-slate-900 placeholder:text-indigo-300' : isHeading ? 'text-base font-bold text-slate-900' : 'text-sm font-semibold text-slate-700'} w-0`} />
        )}
        
        {(isBullets || isTable || isColumns) && (
          <span className="flex-1 text-xs italic text-slate-500 font-medium">
            {isBullets ? `${(el.items||[]).length} points` : isTable ? `${(el.headers||[]).length} cols · ${(el.rows||[]).length} rows` : `${el.cols||2}-column`}
          </span>
        )}

        <div className="flex gap-1.5 ml-auto shrink-0">
          {!isHr && (
            <button onClick={() => { setAiOpen(o=>!o); setAiError(""); }} title="Edit with AI"
              className={`px-2.5 h-7 rounded-md text-xs font-bold transition-colors shadow-sm ${aiOpen ? 'bg-indigo-600 text-white' : isTitle ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
              ✦ AI
            </button>
          )}
          <button onClick={onMoveUp} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 shadow-sm transition-opacity">↑</button>
          <button onClick={onMoveDown} disabled={idx === total - 1} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 shadow-sm transition-opacity">↓</button>
          {!isTitle && <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center border border-red-200 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm font-bold text-xs">✕</button>}
        </div>
      </div>

      {/* ── AI Edit Panel ── */}
      {aiOpen && (
        <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 transition-all">
          <div className="text-xs font-bold text-indigo-800 mb-2.5">✦ Edit with AI — describe the change</div>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && runAiEdit()}
              placeholder="e.g. Make it more formal, add 2 more rows, shorten to 3 bullets…"
              disabled={aiLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium ${inpClass} ${aiLoading ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
            />
            <button onClick={runAiEdit} disabled={aiLoading}
              className={`px-5 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${aiLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {aiLoading ? "⟳ …" : "Apply"}
            </button>
            <button onClick={() => { setAiOpen(false); setAiPrompt(""); setAiError(""); }}
              className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
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
              <span className="text-slate-400 shrink-0 text-xl leading-none mb-1">•</span>
              <input value={item} onChange={e => { const items = [...el.items]; items[i] = e.target.value; onUpdate("items", items); }} className={`flex-1 px-3 py-2 text-sm ${inpClass}`} />
              <button onClick={() => { const items = [...el.items]; items.splice(i, 1); onUpdate("items", items); }} className="text-red-400 hover:text-red-600 shrink-0 text-lg mx-1 flex items-center justify-center p-1 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("items", [...(el.items || []), "New point"])} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors pt-2 pb-1 ml-6">+ Add point</button>
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
            {(el.headers||[]).map((h,ci) => (
              <input key={ci} value={h} onChange={e => { const hs=[...el.headers]; hs[ci]=e.target.value; onUpdate("headers",hs); }}
                className={`flex-1 px-2.5 py-2 text-xs font-bold bg-indigo-50/70 border border-indigo-100 rounded-md focus:outline-none focus:border-indigo-300 text-slate-700`} />
            ))}
          </div>
          {/* Row inputs */}
          {(el.rows||[]).map((row,ri) => (
            <div key={ri} className="flex gap-1.5 mb-1.5">
              {(el.headers||[]).map((_,ci) => (
                <input key={ci} value={(row[ci])||""} onChange={e => {
                  const rows=el.rows.map((r,i)=>i===ri?r.map((c,j)=>j===ci?e.target.value:c):r);
                  onUpdate("rows",rows);
                }} className={`flex-1 px-2.5 py-2 text-xs ${inpClass}`} />
              ))}
              <button onClick={() => onUpdate("rows", el.rows.filter((_,i)=>i!==ri))}
                className="text-red-400 hover:text-red-600 shrink-0 text-lg px-2 flex items-center justify-center hover:bg-red-50 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("rows", [...(el.rows||[]), Array((el.headers||[]).length).fill("")])}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-3 pb-1.5">+ Add row</button>
        </div>
      )}
      {isColumns && (
        <div className="p-4 space-y-4">
          {Array(el.cols||2).fill(null).map((_,i) => (
            <div key={i}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Column {i+1}</div>
              <textarea value={(el.texts||[])[i]||""} rows={2}
                onChange={e => { const t=[...(el.texts||[])]; t[i]=e.target.value; onUpdate("texts",t); }}
                className={`w-full px-3 py-2.5 text-sm resize-y leading-relaxed ${inpClass}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



/* ════════════════════════════════════════════════
   STEP 1 — PROMPT + SINGLE STREAMING GENERATION
════════════════════════════════════════════════ */
const DOC_TYPES = [
  { value: "professional", label: "Professional", icon: "◈" },
  { value: "academic",     label: "Academic",     icon: "◉" },
  { value: "technical",    label: "Technical",    icon: "◧" },
  { value: "business",     label: "Business",     icon: "◆" },
  { value: "report",       label: "Report",       icon: "◎" },
];

function Step1Prompt({ ollamaUrl, ollamaModel, onDone, setLoadingPhase }) {
  const [prompt,   setPrompt]   = useState("");
  const [docType,  setDocType]  = useState("professional");
  const [pages,    setPages]    = useState(3);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [tokens,   setTokens]   = useState(0);
  const [phase,    setPhase]    = useState("idle");
  const [streamLog, setStreamLog] = useState("");
  const abortRef = useRef(false);

  // Exact section count — no band, no AI guessing
  const targetSectionCount = pages <= 2 ? 3 : pages <= 4 ? 5 : pages <= 6 ? 6 : 8;
  // Words per page on A4 ~350. Each body block = 1 paragraph.
  const wordsPerPara  = pages <= 2 ? 120 : pages <= 4 ? 150 : 180;
  // bodyPerSec computed dynamically inside go() after we know actual section count

  let _nid = 0;
  const nid = () => ++_nid;

  /* ── JSON repair helper (only used for bullets/tables) ── */
  const parseJsonRobust = (raw) => {
    const clean = raw.replace(/```json[\s\S]*?```/gi, m => m.replace(/```json|```/gi,""))
                     .replace(/```/g,"").trim();
    try { return JSON.parse(clean); } catch (_) {}
    const m = clean.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!m) throw new Error("No JSON");
    let s = m[0];
    let depth = 0, inStr = false, esc = false;
    for (const c of s) {
      if (esc) { esc = false; continue; }
      if (c === "\\" && inStr) { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (!inStr) { if (c==="{" || c==="[") depth++; else if (c==="}" || c==="]") depth--; }
    }
    if (inStr) s += '"';
    while (depth > 0) { s += "}"; depth--; }
    s = s.replace(/[\u201C\u201D]/g,'"').replace(/,\s*([}\]])/g,"$1");
    return JSON.parse(s);
  };

  /* ── PHASE 1: fast outline (~500 tokens, plain JSON) ── */
  const getOutline = async () => {
    const p =
`You are an expert document architect specializing in ${docType} documents.

Task: Create a precise, professional outline for the following topic.
Topic: "${prompt.trim()}"
Document type: ${docType}
Target pages: ${pages}
Section count: You MUST generate EXACTLY ${targetSectionCount} sections. Do not add more. Do not add fewer.

CRITICAL SECTION RULE:
- If the user's topic already names specific sections, topics, or subtopics to cover, use EXACTLY those as your sections (in that order)
- If the user's topic is general with no named sections, choose the most logical and informative sections for the topic
- First section must always be "Introduction", last must always be "Conclusion" or "Summary"

Respond with ONLY valid JSON — no markdown fences, no commentary:
{"title":"Specific Descriptive Title","sections":[
  {"heading":"Introduction","extras":[]},
  {"heading":"Specific Section Name","extras":["bullets"]},
  {"heading":"Data Analysis & Comparison","extras":["hr","table"]},
  {"heading":"Conclusion","extras":[]}
]}

Rules for section "extras" (choose only what genuinely fits the section content):
- "bullets"  → key features, step-by-step processes, requirements, pros/cons, action items
- "table"    → comparisons, technical specs, metrics, cost/schedule data (max 1 table per section)
- "hr"       → visual separator before a major content shift (max 2 total in document)
- []         → narrative prose sections that need no supplementary elements

Quality requirements:
- Section headings must be specific and meaningful — never generic like "Overview" or "Details"
- Spread "bullets" and "table" across different sections, not clustered in one area
- Every section containing a "table" must also have at least one body paragraph for context
- The document title must be concise, professional, and directly describe the topic

JSON:`;
    let raw = "";
    const gen = streamOllama(ollamaUrl, p, { model: ollamaModel, num_predict: 600, num_ctx: 2048, temperature: 0.2 });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      setStreamLog("Outlining: " + raw.slice(-60));
    }
    return parseJsonRobust(raw);
  };

  /* ── PHASE 2a: plain-text body paragraphs (no JSON overhead) ── */
  const fillBodySection = async (docTitle, heading, numParas, previousSummary, onProgress) => {
    const contextNote = previousSummary
      ? `Context so far (do NOT repeat these ideas): ${previousSummary}`
      : `This is the opening section — set the stage without referring to prior content.`;
    const p =
`You are a professional ${docType} writer. Write ${numParas} cohesive body paragraph(s) for a section in a document.

Document title: "${docTitle}"
Section heading: "${heading}"
Document type: ${docType}
Target length per paragraph: ${wordsPerPara}–${wordsPerPara+50} words

${contextNote}

Writing requirements:
- Write detailed, authoritative prose appropriate for a ${docType} document
- Each paragraph must focus on a distinct aspect or sub-topic of the section
- Paragraphs must flow naturally from one to the next with logical transitions
- Separate each paragraph with a single blank line

Inline formatting (only where it genuinely improves clarity):
- **bold** → key terms, critical concepts (2–4 times per paragraph maximum)
- _italic_ → titles of works, technical jargon (use sparingly)

STRICT PROHIBITIONS — violating any of these rules is an error:
- NO bolding of random keywords or decorative phrases
- NO opening sentences like "In this section we will discuss..." or "This section covers..."
- NO closing summary sentences like "In conclusion..." or "To summarize..." inside body paragraphs
- NO filler phrases: "In today's fast-paced world", "Moreover", "Furthermore", "It is worth noting", "It is a testament to"
- NO made-up statistics or fabricated case studies
- NO headings, bullet points, JSON, preamble, or sign-off text

Paragraphs:`;
    let raw = "";
    const gen = streamOllama(ollamaUrl, p, {
      model: ollamaModel,
      num_predict: numParas * (wordsPerPara + 60) * 2,
      num_ctx: 4096,
      temperature: 0.35,
    });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      onProgress(raw.length);
    }
    // Split on blank lines → array of paragraphs
    const paras = raw.split(/\n\s*\n/).map(p => p.replace(/\n/g," ").trim()).filter(p => p.length > 40);
    return paras.length ? paras : [raw.trim()];
  };

  /* ── PHASE 2b: bullets (tiny JSON call) ── */
  const fillBullets = async (docTitle, heading) => {
    const p =
`You are a professional ${docType} writer creating concise, high-impact bullet points.

Document title: "${docTitle}"
Section: "${heading}"
Document type: ${docType}

Write exactly 5 bullet points that capture the most important takeaways, features, or steps for this section.

Formatting rules:
- Start each bullet with **Bold Key Term** or **Bold Short Phrase** followed by a colon and explanation
- Explanation should be 15–25 words — specific, informative, and actionable
- Use _italic_ sparingly for technical terms or titles within the explanation
- Each bullet must be distinct — no overlapping content

Return ONLY a valid JSON array of 5 strings. No markdown fences, no extra text:
["**Term One**: clear explanation of this point in 15 to 25 words","**Term Two**: explanation here",...]
JSON:`;
    let raw = "";
    const gen = streamOllama(ollamaUrl, p, { model: ollamaModel, num_predict: 400, num_ctx: 2048, temperature: 0.6 });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }
    try {
      const arr = parseJsonRobust(raw);
      return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
    } catch (_) {
      return raw.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/,"").trim()).filter(l => l.length > 10).slice(0,6);
    }
  };

  /* ── PHASE 2c: table (tiny JSON call) ── */
  const fillTable = async (docTitle, heading) => {
    const p =
`You are a professional ${docType} writer. Create a structured data table for a document section.

Document title: "${docTitle}"
Section: "${heading}"
Document type: ${docType}

Table requirements:
- Invent 3 column headers that are SPECIFIC and MEANINGFUL for "${heading}" — e.g. for a finance section use "Revenue", "Growth %", "Region"; for a comparison use "Feature", "Option A", "Option B"; for a timeline use "Year", "Milestone", "Impact"
- NEVER use generic headers like "Aspect", "Item", "Value", "Detail", "Notes", "Column 1"
- Include exactly 4 data rows with realistic, specific, and varied values
- Every cell must contain meaningful content relevant to "${heading}"

IMPORTANT: Return ONLY the raw JSON object — absolutely nothing else before or after it:
{"headers":["Header1","Header2","Header3"],"rows":[["val","val","val"],["val","val","val"],["val","val","val"],["val","val","val"]]}
JSON:`;
    let raw = "";
    const gen = streamOllama(ollamaUrl, p, { model: ollamaModel, num_predict: 700, num_ctx: 2048, temperature: 0.25 });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }

    // Multi-attempt extraction
    let obj = null;
    const attempts = [
      () => parseJsonRobust(raw),
      () => parseJsonRobust(raw.slice(raw.search(/\{/))),
      () => { const m = raw.match(/\{[\s\S]*"headers"[\s\S]*"rows"[\s\S]*\}/); if(m) return parseJsonRobust(m[0]); throw new Error(); },
    ];
    for (const attempt of attempts) {
      try { obj = attempt(); if (obj && Array.isArray(obj.headers)) break; } catch(_) {}
    }

    if (obj && Array.isArray(obj.headers) && obj.headers.length >= 2) {
      const headers = obj.headers.map(h => String(h).trim()).filter(Boolean).slice(0, 4);
      const n = headers.length;
      const headerSet = new Set(headers.map(h => h.toLowerCase()));
      const rows = (Array.isArray(obj.rows) ? obj.rows : [])
        .map(row => {
          const cells = (Array.isArray(row) ? row : []).map(c => String(c || "").trim());
          while (cells.length < n) cells.push("—");
          return cells.slice(0, n).map(c => c || "—");
        })
        .filter(row => {
          const nonEmpty = row.filter(c => c && c !== "—").length;
          if (nonEmpty === 0) return false;
          // Only drop if ALL cells exactly match header names (not just partial match)
          const allMatchHeader = row.filter(c => c !== "—").every(c => headerSet.has(c.toLowerCase().trim()));
          return !allMatchHeader;
        });
      if (rows.length > 0) return { headers, rows };
    }

    // Fallback: generate contextual headers derived from the heading
    const words = heading.replace(/[^a-zA-Z0-9 ]/g,"").split(" ").filter(w => w.length > 3);
    const GENERIC = new Set(["aspect","item","value","detail","notes","column","factor","point","data","info","type","name","description"]);
    const meaningful = words.filter(w => !GENERIC.has(w.toLowerCase()));
    const h1 = meaningful[0] || words[0] || "Category";
    const h2 = meaningful[1] || words[1] || heading.split(" ").slice(0,2).join(" ") || "Details";
    const h3 = meaningful[2] || "Impact";
    return {
      headers: [h1.charAt(0).toUpperCase()+h1.slice(1), h2.charAt(0).toUpperCase()+h2.slice(1), h3.charAt(0).toUpperCase()+h3.slice(1)],
      rows: [
        ["Primary element",   "Key detail for " + h1,   "High significance"],
        ["Secondary element", "Supporting data for " + h2, "Medium significance"],
        ["Tertiary element",  "Additional context",       "Varies by case"],
        ["Supplementary",     "Comparative measure",      "Context dependent"],
      ]
    };
  };

  /* ── MAIN go() ── */
  const go = async () => {
    if (!prompt.trim()) { setError("Please describe your document."); return; }
    setError(""); setLoading(true); setTokens(0); setPhase("structure");
    setStreamLog("Connecting to Ollama…");
    setLoadingPhase("template");
    abortRef.current = false;
    _nid = 0;

    try {
      // ── Phase 1: outline (fast) ──
      const outline = await getOutline();
      if (abortRef.current || !outline) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }

      // Safety truncation: never trust AI count — enforce exactly what user requested
      const rawSections = Array.isArray(outline.sections) ? outline.sections : [];
      const sections = rawSections.slice(0, targetSectionCount);
      if (!sections.length) throw new Error("Outline empty. Try again.");

      // Compute bodyPerSec dynamically based on actual section count and target pages
      const actualSecCount = sections.length;
      const totalTargetWords = pages * 350;
      const dynamicBodyPerSec = Math.max(1, Math.round((totalTargetWords * 0.75) / (actualSecCount * wordsPerPara)));

      setPhase("content");

      // ── Phase 2: sequential sections but each section's calls optimised ──
      // Sequential because qwen2.5:7b is single-GPU — parallel = no speedup, just memory pressure
      const elements = [];
      elements.push({ id: nid(), type: "title", text: outline.title || "Document" });

      let previousSummary = ""; // contextual memory for amnesia fix

      for (let i = 0; i < sections.length; i++) {
        if (abortRef.current) break;
        const sec = sections[i];
        const heading = sec.heading || `Section ${i+1}`;
        const extras  = Array.isArray(sec.extras) ? sec.extras : [];

        setStreamLog(`Section ${i+1}/${sections.length}: ${heading}…`);
        setTokens(Math.round((i / sections.length) * 100));

        elements.push({ id: nid(), type: "h1", text: heading });

        // Body paragraphs — pass previous summary for contextual memory
        const paras = await fillBodySection(outline.title || "Document", heading, dynamicBodyPerSec, previousSummary, (len) => {
          setStreamLog(`Section ${i+1}/${sections.length} — ${heading}: ${Math.round(len/4)} tokens`);
        });
        if (abortRef.current) break;
        if (paras) {
          elements.push({ id: nid(), type: "paragraph", texts: paras });
          // Update contextual memory: one-sentence summary of this section
          previousSummary += (previousSummary ? " " : "") + `Section "${heading}" covered: ${paras[0].slice(0, 120).replace(/\n/g," ")}...`;
          // Keep summary concise — only last 2 sections worth
          const summaryParts = previousSummary.split('Section "');
          if (summaryParts.length > 3) previousSummary = 'Section "' + summaryParts.slice(-2).join('Section "');
        }

        // Extras: hr, bullets, table — in the order the outline specified
        for (const extra of extras) {
          if (abortRef.current) break;
          if (extra === "hr") {
            elements.push({ id: nid(), type: "hr" });
          } else if (extra === "bullets") {
            setStreamLog(`Section ${i+1}/${sections.length} — ${heading}: writing bullets…`);
            const items = await fillBullets(outline.title || "Document", heading);
            if (abortRef.current) break;
            if (items && items.length) elements.push({ id: nid(), type: "bullets", items });
          } else if (extra === "table") {
            setStreamLog(`Section ${i+1}/${sections.length} — ${heading}: writing table…`);
            const tbl = await fillTable(outline.title || "Document", heading);
            if (abortRef.current) break;
            if (tbl) elements.push({ id: nid(), type: "table", headers: tbl.headers, rows: tbl.rows });
          }
        }
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          {ollamaModel} · local AI · streaming
        </div>
        <h2 className="db-serif text-4xl md:text-[52px] text-slate-900 tracking-tight leading-tight mb-4">
          What do you want to create?
        </h2>
        <p className="text-slate-500 text-base md:text-lg font-medium">
          One prompt → full .docx, streamed in real time. No cloud, no API key.
        </p>
      </div>

      {/* Guiding tip */}
      <div className="w-full mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
        <span className="text-amber-500 text-lg shrink-0 mt-0.5">💡</span>
        <div className="text-[13px] text-amber-800 font-medium leading-relaxed">
          <strong>Tip:</strong> Be specific in your prompt. Mention the audience, purpose, and tone (e.g. <em>"a formal Q3 sales report for investors, 4 pages"</em>). The more context you give, the better the output.
        </div>
      </div>

      <div className="w-full space-y-6 bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-[28px] border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
        {/* Prompt input */}
        <div className="w-full">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Document Prompt</label>
          <textarea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={loading}
            placeholder='e.g. "Technical report on Python vs JavaScript for web development — for a software engineering audience, 3 pages"'
            className="w-full px-5 py-4 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 transition-all resize-y text-[15px] leading-relaxed placeholder:text-slate-400 font-medium" />
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-slate-400 font-medium">Press Generate below when you're ready</p>
            <p className={`text-[11px] font-semibold ${prompt.length > 20 ? 'text-indigo-500' : 'text-slate-300'}`}>{prompt.length} chars</p>
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
                    style={a ? {background:'linear-gradient(135deg,#6366f1,#8b5cf6)'} : {}}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-[13px] font-bold text-slate-900 mb-1">{pageLabel}</div>
              <div className="text-[11px] text-slate-400 font-semibold">~{pages * 400} words · {targetSectionCount} sections</div>
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
          className={`w-full py-4 px-8 rounded-full font-bold text-[15px] flex items-center justify-center gap-3 transition-all ${
            loading || !prompt.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)] hover:scale-[1.01]'
          }`}
          style={!(loading || !prompt.trim()) ? {background:'linear-gradient(135deg,#6366f1,#8b5cf6)'} : {}}>
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

/* ════════════════════════════════════════════════
   STEP 2 — TEMPLATE EDITOR (review + tweak generated content)
════════════════════════════════════════════════ */
function Step2Editor({ elements, setElements, docStyles, setDocStyles, ollamaUrl, ollamaModel, onBack, onDone, setLoadingPhase, targetPages }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateEl      = (id, k, v)      => setElements(t => t.map(el => el.id === id ? { ...el, [k]: v } : el));
  const removeEl      = id              => setElements(t => t.filter(el => el.id !== id));
  const moveUp        = idx             => { if (idx === 0) return; const t = [...elements]; [t[idx-1], t[idx]] = [t[idx], t[idx-1]]; setElements(t); };
  const moveDown      = idx             => { if (idx === elements.length - 1) return; const t = [...elements]; [t[idx], t[idx+1]] = [t[idx+1], t[idx]]; setElements(t); };
  const updateElBatch = (id, patches)   => setElements(t => t.map(el => el.id === id ? { ...el, ...patches } : el));

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
    { label: "Blocks",      value: elements.length,                                                              icon: "⬡" },
    { label: "Sections",    value: elements.filter(e => e.type === "h1").length,                                  icon: "§" },
    { label: "AI Content",  value: elements.filter(e => ["paragraph","body","bullets","table","columns"].includes(e.type)).length, icon: "✦" },
  ];

  return (
    <div className="w-full flex flex-col">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.18em] mb-1">Step 2 <span className="text-slate-300 mx-1">|</span> Review &amp; Edit</div>
          <h2 className="db-serif text-3xl text-slate-900 tracking-tight leading-tight">Generated Document</h2>
          <p className="text-slate-400 text-[13px] mt-1 font-medium">Review every block, tweak content, then build your .docx file.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button onClick={onBack} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-bold transition-all border border-slate-200">← Regenerate</button>
          <button onClick={build} disabled={loading} className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
            loading ? 'bg-indigo-300 text-white cursor-not-allowed' : 'text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)]'
          }`} style={!loading ? {background:'linear-gradient(135deg,#6366f1,#8b5cf6)'} : {}}>
            {loading ? "⟳ Building…" : "⬇ Build .docx"}
          </button>
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="flex gap-6 items-start">

        {/* LEFT PANEL — wider at 420px */}
        <div className="w-[420px] shrink-0 flex flex-col gap-4 sticky top-6">

          {/* Guiding message */}
          <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3.5">
            <span className="text-indigo-500 text-base shrink-0 mt-0.5">💡</span>
            <div className="text-[12px] text-indigo-700 font-medium leading-relaxed">
              <strong>Reviewing your document?</strong> Use the <span className="bg-indigo-100 px-1.5 py-0.5 rounded font-bold text-[11px]">✦ AI</span> button on any block to rewrite, expand, or shorten it. Reorder blocks with ↑↓ arrows.
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl p-5 text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <StyleEditor docStyles={docStyles} setDocStyles={setDocStyles} />
          </div>

          {/* Style hint */}
          <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm shrink-0 mt-0.5">⚙️</span>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Use <strong>Global Style Settings</strong> above to set fonts, colors, and spacing that apply to the entire document.</p>
          </div>

          {/* Build CTA */}
          <button onClick={build} disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all ${
            loading ? 'bg-indigo-300 text-white cursor-not-allowed' : 'text-white shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-[1.01]'
          }`} style={!loading ? {background:'linear-gradient(135deg,#6366f1,#8b5cf6)'} : {}}>
            {loading ? "⟳ Building…" : "⬇ Build .docx File"}
          </button>
        </div>

        {/* RIGHT PANEL — Document Blocks */}
        <div className="flex-1 min-w-0">
          {/* Guiding header for block panel */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{elements.length} blocks</p>
            <p className="text-[11px] text-slate-400 font-medium">Click any block to expand and edit</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            {elements.map((el, idx) => (
              <TemplateBlock key={el.id} el={el} idx={idx} total={elements.length}
                onUpdate={(k, v) => updateEl(el.id, k, v)}
                onUpdateBatch={patches => updateElBatch(el.id, patches)}
                onRemove={() => removeEl(el.id)}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)}
                ollamaUrl={ollamaUrl}
                ollamaModel={ollamaModel} />
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-sm font-medium flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center font-bold shrink-0">!</div>
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════
   STEP 3 — RESULT
════════════════════════════════════════════════ */
function Step3Result({ result, onStartOver, onBack }) {
  const { filled, uint8, title } = result;
  const [showPreview, setShowPreview] = useState(false);

  const download = () => {
    const name = (title.slice(0, 40).replace(/[^a-z0-9]/gi, "_") || "document") + ".docx";
    const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const totalParas = filled.filter(e => e.type === "paragraph" || e.type === "body").reduce((s, e) => s + (e.texts?.length || 1), 0)
    + filled.filter(e => e.type === "bullets").reduce((s, e) => s + (e.items?.length || 1), 0);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-10 text-center">
      {showPreview && <DocPreviewModal uint8={uint8} title={title} onClose={() => setShowPreview(false)} />}
      
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black mb-8 shadow-[0_10px_32px_rgba(99,102,241,0.4)]" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>✓</div>
      
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
        <button onClick={download} className="px-8 py-3.5 text-white rounded-2xl text-[15px] font-bold shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>⬇ Download .docx</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   STEPPER
════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════
   LOADING OVERLAY
════════════════════════════════════════════════ */
function LoadingOverlay({ phase }) {
  const msg = phase === "template" ? "Streaming from Ollama…" : phase === "docx" ? "Assembling .docx file…" : "Working…";
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
/* ════════════════════════════════════════════════
   ROOT — Doc Builder
════════════════════════════════════════════════ */
export default function CoreAppFlow() {
  const [step,         setStep]         = useState(0);
  const [elements,     setElements]     = useState([]);
  const [targetPages,  setTargetPages]  = useState(3);
  const [result,       setResult]       = useState(null);
  const [docStyles,    setDocStyles]    = useState({
    title:       { ...DEFAULT_DOC_STYLES.title },
    h1:          { ...DEFAULT_DOC_STYLES.h1 },
    h2:          { ...DEFAULT_DOC_STYLES.h2 },
    paragraph:   { ...DEFAULT_DOC_STYLES.paragraph },
    table:       { ...DEFAULT_DOC_STYLES.table },
    bullets:     { ...DEFAULT_DOC_STYLES.bullets },
    pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins },
  });
  const [loadingPhase, setLoadingPhase] = useState(null);

  const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
  const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "qwen2.5:7b";

  useEffect(() => {
    if (!window.JSZip) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
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
    <div className="relative min-h-screen text-slate-900 font-sans overflow-hidden" style={{background:'#f0f4ff'}}>
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
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter:'blur(80px)'}} />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter:'blur(80px)'}} />
      </div>

      {/* Central Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto min-h-screen flex flex-col pt-5 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Header */}
        <nav className="flex justify-between items-center py-3 px-5 md:px-6 bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)] rounded-2xl mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.4)] flex items-center justify-center" style={{background:'#c7cbe8'}}>
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="brand-font text-[18px] text-slate-900">DocReplacer</span>
          </div>

          <div className="hidden sm:flex justify-center items-center gap-2">
            {['Describe', 'Review', 'Done'].map((s, i) => {
              const done = step > i, active = step === i;
              return (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${active ? 'bg-indigo-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                      done ? 'bg-slate-800 text-white' : active ? 'text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]' : 'bg-slate-100 text-slate-400'
                    }`} style={active ? {background:'linear-gradient(135deg,#6366f1,#8b5cf6)'} : {}}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`font-semibold text-[13px] ${active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'}`}>{s}</span>
                  </div>
                  {i < 2 && <div className={`w-8 h-px transition-colors ${step > i ? 'bg-slate-800' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a href="/" className="text-[13px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50">← Home</a>
            {step > 0 && <button onClick={startOver} className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">Start Over</button>}
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center w-full">
          <div className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 md:p-10 relative">

          {step === 0 && (
            <Step1Prompt
              ollamaUrl={ollamaUrl}
              ollamaModel={OLLAMA_MODEL}
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
              ollamaUrl={ollamaUrl}
              ollamaModel={OLLAMA_MODEL}
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