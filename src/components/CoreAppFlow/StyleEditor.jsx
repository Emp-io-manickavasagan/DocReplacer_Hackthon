import React, { useState, useEffect, useRef } from 'react';
import { C, DEFAULT_DOC_STYLES, BULLET_STYLES, BULLET_STYLE_NAMES } from '../../utils/constants.js';
const FONTS = ["Arial", "Times New Roman", "Georgia", "Calibri", "Verdana", "Garamond", "Trebuchet MS", "Palatino Linotype", "Helvetica", "Tahoma"];
const ALIGNS = [{ v: "left", l: "Left" }, { v: "center", l: "Center" }, { v: "right", l: "Right" }, { v: "justify", l: "Justify" }];
const SPACINGS = [{ v: 1.0, l: "1.0×" }, { v: 1.15, l: "1.15×" }, { v: 1.5, l: "1.5×" }, { v: 2.0, l: "2.0×" }];

const STYLE_TABS = [
  { key: "title", label: "Title", dot: C.blue900 },
  { key: "h1", label: "Heading 1", dot: C.blue700 },
  { key: "h2", label: "Heading 2", dot: C.blue500 },
  { key: "paragraph", label: "Paragraph", dot: C.gray600 },
  { key: "bullets", label: "Bullets", dot: C.gray700 },
  { key: "table", label: "Table", dot: C.teal },
  { key: "pageMargins", label: "Margins", dot: C.purple },
];

const TYPE_ACCENT_COL = { title: C.blue900, h1: C.blue700, h2: C.blue500, paragraph: C.gray600, body: C.gray600, table: C.teal };

/* small reusable field-label */
const FL = ({ children }) => (
  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{children}</div>
);

/* color row: swatch + hex input */
const ColorRow = ({ label, value, onChange }) => (
  <div>
    <FL>{label}</FL>
    <div className="flex gap-2 items-center">
      <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 border border-slate-200 rounded-lg cursor-pointer p-0.5 shrink-0 bg-white" />
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="#000000"
        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
    </div>
  </div>
);

function StyleEditor({ docStyles, setDocStyles }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("paragraph");

  const set = (type, key, val) => setDocStyles(p => ({ ...p, [type]: { ...p[type], [key]: val } }));
  const reset = (type) => setDocStyles(p => ({ ...p, [type]: { ...DEFAULT_DOC_STYLES[type] } }));

  const s = docStyles[tab] || {};
  const iStClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  /* live preview text */
  const previewText = tab === "title" ? "Document Title — Preview" : tab === "h1" ? "1. Major Section Heading" : tab === "h2" ? "1.1 Sub-section Heading" : tab === "table" ? null : "Body paragraph text appears here. Font, size, colour and spacing all apply.";

  /* table preview */
  const TablePreview = () => {
    const ts = docStyles.table || DEFAULT_DOC_STYLES.table;
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm mt-3">
        <table className="w-full border-collapse" style={{ fontFamily: ts.font || "Times New Roman", fontSize: ts.size || 11 }}>
          <thead>
            <tr>{["Header 1", "Header 2", "Header 3"].map((h, i) => (
              <th key={i} style={{ background: ts.headerBg || "#1e3a8a", color: ts.headerColor || "#ffffff", padding: "8px 12px", border: `1px solid ${ts.borderColor || "#374151"}`, fontWeight: 700, textAlign: "left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[["Row A value", "Detail text", "123"], ["Row B value", "Another detail", "456"]].map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 1 ? (ts.rowAltBg || "#eff6ff") : "transparent" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "8px 12px", border: `1px solid ${ts.borderColor || "#374151"}`, color: ts.color || "#000000" }}>{cell}</td>
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
        className={`w-full flex items-center justify-between px-4 py-3.5 border-none cursor-pointer text-left transition-colors outline-none focus:ring-0 ${open ? 'bg-slate-900' : 'bg-slate-50 hover:bg-slate-100'
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
                className={`flex-1 min-w-[85px] px-3 py-2.5 border-none bg-transparent cursor-pointer text-xs font-bold whitespace-nowrap transition-all border-b-[3px] ${tab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
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
                    <select value={s.font || "Arial"} onChange={e => set(tab, "font", e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Size (pt)</FL>
                    <input type="number" min={6} max={96} value={s.size || 12} onChange={e => set(tab, "size", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Row 2: Text Color + Background Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Text Color" value={s.color || "#000000"} onChange={v => set(tab, "color", v)} />
                  <ColorRow label="Background Color" value={s.bgColor || ""} onChange={v => set(tab, "bgColor", v)} />
                </div>

                {/* Row 3: Alignment + Line Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Alignment</FL>
                    <select value={s.align || "left"} onChange={e => set(tab, "align", e.target.value)} className={iStClass}>
                      {ALIGNS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Line Spacing</FL>
                    <select value={s.lineSpacing || 1.5} onChange={e => set(tab, "lineSpacing", Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Space Before + Space After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Space Before (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginTop || 0} onChange={e => set(tab, "marginTop", Number(e.target.value))} className={iStClass} />
                  </div>
                  <div>
                    <FL>Space After (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginBottom || 8} onChange={e => set(tab, "marginBottom", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Row 5: Bold + Italic toggles */}
                <div className="flex gap-4 mb-5">
                  {[["Bold", "bold"], ["Italic", "italic"]].map(([lb, key]) => (
                    <button key={key} onClick={() => set(tab, key, !s[key])}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-all focus:outline-none ${s[key] ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      style={{ fontStyle: key === "italic" ? "italic" : "normal" }}>
                      {lb} {s[key] ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                  <div style={{
                    fontFamily: s.font, fontSize: s.size, color: s.color, textAlign: s.align,
                    fontWeight: s.bold ? "bold" : "normal", fontStyle: s.italic ? "italic" : "normal",
                    lineHeight: s.lineSpacing, background: s.bgColor || "transparent", padding: s.bgColor ? "6px 8px" : 0, borderRadius: 4,
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
                        const sym = (BULLET_STYLES[name].lvlText || "").replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
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
                      <input type="number" min={0} max={2880} step={120} value={bs.indentLeft || 720}
                        onChange={e => setBullet("indentLeft", Number(e.target.value))} className={iStClass} />
                      <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Default: 720 (½ inch)</div>
                    </div>
                    <div>
                      <FL>Hanging Indent (twips)</FL>
                      <input type="number" min={0} max={1440} step={120} value={bs.hanging || 360}
                        onChange={e => setBullet("hanging", Number(e.target.value))} className={iStClass} />
                      <div className="text-[10px] text-slate-400 mt-1.5 font-medium">Default: 360 (¼ inch)</div>
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <FL>Space After Each Item (pt)</FL>
                      <input type="number" min={0} max={60} value={bs.itemSpacingAfter ?? 6}
                        onChange={e => setBullet("itemSpacingAfter", Number(e.target.value))} className={iStClass} />
                    </div>
                    <div>
                      <FL>Line Spacing</FL>
                      <select value={bs.lineSpacing || 1.5} onChange={e => setBullet("lineSpacing", Number(e.target.value))} className={iStClass}>
                        {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                    {["First bullet point", "Second bullet point", "Third bullet point"].map((text, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: bs.itemSpacingAfter ?? 6, lineHeight: bs.lineSpacing || 1.5, fontFamily: (docStyles.paragraph || docStyles.body)?.font || "Times New Roman", fontSize: (docStyles.paragraph || docStyles.body)?.size || 12, color: (docStyles.paragraph || docStyles.body)?.color || "#000000", paddingLeft: Math.round((bs.indentLeft || 720) / 20) }}>
                        <span style={{ flexShrink: 0, minWidth: 16 }}>{previewSymbol}</span>
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
                    <select value={s.font || "Times New Roman"} onChange={e => set("table", "font", e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Font Size</FL>
                    <input type="number" min={6} max={24} value={s.size || 11} onChange={e => set("table", "size", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Header BG + Header Text Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Header Background" value={s.headerBg || "#1e3a8a"} onChange={v => set("table", "headerBg", v)} />
                  <ColorRow label="Header Text Color" value={s.headerColor || "#ffffff"} onChange={v => set("table", "headerColor", v)} />
                </div>

                {/* Alt row BG + Body text color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Alt Row Background" value={s.rowAltBg || "#eff6ff"} onChange={v => set("table", "rowAltBg", v)} />
                  <ColorRow label="Body Text Color" value={s.color || "#000000"} onChange={v => set("table", "color", v)} />
                </div>

                {/* Border color + Line spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <ColorRow label="Border Color" value={s.borderColor || "#374151"} onChange={v => set("table", "borderColor", v)} />
                  <div>
                    <FL>Row Spacing</FL>
                    <select value={s.lineSpacing || 1.15} onChange={e => set("table", "lineSpacing", Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Table live preview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Preview</div>
                  <TablePreview />
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
                    className={iStClass} />
                </div>
              );
              // Preset buttons matching Word's margin presets
              const PRESETS = [
                { label: "Normal", vals: { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 } },
                { label: "Narrow", vals: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 } },
                { label: "Moderate", vals: { top: 1.0, bottom: 1.0, left: 0.75, right: 0.75 } },
                { label: "Wide", vals: { top: 1.0, bottom: 1.0, left: 2.0, right: 2.0 } },
              ];
              const isActive = (vals) => ["top", "bottom", "left", "right"].every(k => Math.abs((pm[k] ?? 1.0) - vals[k]) < 0.01);
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
                          position: "absolute",
                          top: `${(pm.top ?? 1) / 11 * 100}%`,
                          bottom: `${(pm.bottom ?? 1) / 11 * 100}%`,
                          left: `${(pm.left ?? 1) / 8.5 * 100}%`,
                          right: `${(pm.right ?? 1) / 8.5 * 100}%`,
                          border: `1.5px dashed #818cf8`,
                          borderRadius: 2,
                        }} />
                        {/* Label badges */}
                        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">T:{pm.top ?? 1}"</div>
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">B:{pm.bottom ?? 1}"</div>
                        <div className="absolute left-[2px] top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">L:{pm.left ?? 1}"</div>
                        <div className="absolute right-[2px] top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">R:{pm.right ?? 1}"</div>
                        {/* Content lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            position: "absolute",
                            top: `calc(${(pm.top ?? 1) / 11 * 100}% + ${12 + i * 14}px)`,
                            left: `calc(${(pm.left ?? 1) / 8.5 * 100}% + 4px)`,
                            right: `calc(${(pm.right ?? 1) / 8.5 * 100}% + 4px)`,
                            height: 2, background: "#cbd5e1", borderRadius: 1
                          }} />
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
                  ↺ Reset {STYLE_TABS.find(t => t.key === tab)?.label} to defaults
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

export default StyleEditor;
