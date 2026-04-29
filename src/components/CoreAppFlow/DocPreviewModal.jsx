import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
          // NOTE: unpkg does not provide SRI hashes. To harden this further, self-host
          // docx-preview and add a proper integrity hash.
          s.crossOrigin = "anonymous";
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


export default DocPreviewModal;
