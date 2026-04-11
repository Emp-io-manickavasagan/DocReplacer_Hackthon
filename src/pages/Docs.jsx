import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowLeft, FileText, Zap, Lock, Layers, Code } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* --- SEO & META TAGS HEAD INJECTION --- */}
      <Helmet>
        <title>Documentation | DocReplacer Free AI Word Document Generator</title>
        <meta name="description" content="Read the official documentation for DocReplacer. Learn how our client-side AI document builder generates private, fully formatted .docx files directly in your browser." />
        <meta name="keywords" content="DocReplacer docs, AI document generator tutorial, how to generate docx with AI, client-side OpenXML builder, private AI word generator guide" />
        <link rel="canonical" href="https://docreplacer.com/docs" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://docreplacer.com/docs" />
        <meta property="og:title" content="DocReplacer Documentation | Private AI .docx Generator" />
        <meta property="og:description" content="Official guide to generating private Word documents with DocReplacer AI." />
        <meta property="og:image" content="https://docreplacer.com/Logo.ico" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://docreplacer.com/docs" />
        <meta property="twitter:title" content="DocReplacer Documentation | Private AI .docx Generator" />
        <meta property="twitter:description" content="Official guide to generating private Word documents with DocReplacer AI." />
      </Helmet>

      {/* AEO: FAQPage Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is my data sent to a server for document creation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. DocReplacer is a fully client-side application. While text generation uses an AI endpoint, the construction and zipping of the .docx file happens locally on your device."
              }
            },
            {
              "@type": "Question",
              "name": "Can I change the formatting of the generated document?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. The Global Style Settings menu allows you to adjust font families, text sizes, alignments, line spacing, margins, and table aesthetics before downloading."
              }
            },
            {
              "@type": "Question",
              "name": "Will the .docx file work in standard word processors?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. DocReplacer builds valid Open XML documents, ensuring 100% compatibility with Microsoft Word, Google Docs, and LibreOffice."
              }
            },
            {
              "@type": "Question",
              "name": "Do I need an account to use DocReplacer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. DocReplacer is built on a utility-first model. Just open the app, enter your prompt, and generate your file without any account needed."
              }
            }
          ]
        })}
      </script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .serif { font-family: 'DM Serif Display', serif; }
        .mono { font-family: 'DM Mono', monospace; }
        code { background: rgba(99,102,241,0.12); padding: 2px 7px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 13px; color: #a5b4fc; }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl shadow-lg flex items-center justify-center" style={{background:'#c7cbe8'}}>
              <img src="/Logo.ico" alt="DocReplacer AI Generator Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white">DocReplacer</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[13px] font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-6">
              ✦ Official Documentation
            </div>
            <h1 className="serif text-[48px] md:text-[56px] text-white leading-tight mb-4">DocReplacer Docs</h1>
            <p className="text-white/50 text-lg leading-relaxed">The fastest, most secure way to generate professional <code>.docx</code> files from a single prompt using client-side AI.</p>
          </div>

          <div className="space-y-14">

            {/* Introduction */}
            <section>
              <h2 className="serif text-[28px] text-white mb-3">Introduction</h2>
              <div className="w-10 h-px bg-indigo-500/40 mb-5" />
              <p className="text-white/60 leading-relaxed">
                DocReplacer is a utility-first web application designed to instantly transform simple text prompts into fully formatted, ready-to-download Microsoft Word (<code>.docx</code>) documents.
              </p>
              <p className="text-white/60 leading-relaxed mt-4">
                Built with privacy and efficiency in mind, DocReplacer operates entirely on the frontend without relying on server-side databases. By converting AI-generated JSON payloads directly into valid XML structures and compressing them locally within your browser, your data remains completely private, and your inputs are never stored.
              </p>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="serif text-[28px] text-white mb-3">How DocReplacer Works</h2>
              <div className="w-10 h-px bg-indigo-500/40 mb-5" />
              <p className="text-white/60 mb-8">DocReplacer simplifies AI document creation into a seamless three-step workflow:</p>

              <div className="space-y-5">
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[12px] font-bold shrink-0">1</span>
                    <h3 className="font-bold text-white text-[16px]">Describe — Prompt & Configuration</h3>
                  </div>
                  <p className="text-white/55 text-[14px] leading-relaxed mb-4">Start by providing a single prompt describing the document you need. You have full control over the initial structure:</p>
                  <ul className="space-y-2 text-[14px] text-white/55">
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Document Type:</span> Choose the appropriate tone — Professional, Academic, Technical, Business, or Report.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Target Length:</span> Select anywhere from 1 to 10 pages. The system automatically calculates the necessary sections and word counts.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Smart Outlining:</span> The AI analyzes your prompt and generates a precise document outline, ensuring logical flow from introduction to conclusion.</span></li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[12px] font-bold shrink-0">2</span>
                    <h3 className="font-bold text-white text-[16px]">Review & Edit — The Template Editor</h3>
                  </div>
                  <p className="text-white/55 text-[14px] leading-relaxed mb-4">Before generating the final file, DocReplacer presents your content in an interactive block-based editor.</p>
                  <ul className="space-y-2 text-[14px] text-white/55">
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Block Management:</span> Reorder sections using up/down arrows, delete unnecessary blocks, or manually type in edits.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Surgical AI Edits:</span> Click the ✦ AI button on any block to rewrite, expand, or format that exact section without regenerating the entire document.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Global Style Settings:</span> Customize font families, sizes, colors, line spacing, bullet styles, and page margins before downloading.</span></li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[12px] font-bold shrink-0">3</span>
                    <h3 className="font-bold text-white text-[16px]">Done — Preview & Download</h3>
                  </div>
                  <p className="text-white/55 text-[14px] leading-relaxed mb-4">Once you are satisfied with the content and styling:</p>
                  <ul className="space-y-2 text-[14px] text-white/55">
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">In-Browser Preview:</span> View a high-fidelity preview of your document directly in the browser to ensure formatting is perfect.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Instant Assembly:</span> The app uses local compression to package your content into a standard <code>.docx</code> file in seconds.</span></li>
                    <li className="flex gap-2"><span className="text-indigo-400 shrink-0">→</span><span><span className="text-white/80 font-semibold">Download:</span> Save the file straight to your local machine.</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="serif text-[28px] text-white mb-3">Key Features & Capabilities</h2>
              <div className="w-10 h-px bg-indigo-500/40 mb-5" />
              <div className="space-y-4">
                {[
                  { icon: <Lock className="w-4 h-4 text-violet-400" />, title: '100% Client-Side Architecture', desc: 'The conversion from JSON to XML and the final .docx compression happen entirely within your local browser environment.' },
                  { icon: <Zap className="w-4 h-4 text-indigo-400" />, title: 'No-Training API Guarantee', desc: 'DocReplacer utilizes models for text generation without logging your prompts or using your private data for model training.' },
                  { icon: <Layers className="w-4 h-4 text-blue-400" />, title: 'Rich Document Structures', desc: 'Supports Titles, H1/H2 Headings, rich-text paragraphs (bold, italic, hyperlinks), structured Tables, bullet lists, and multi-column layouts.' },
                  { icon: <FileText className="w-4 h-4 text-emerald-400" />, title: 'Dynamic Data Tables', desc: 'The AI generates specific, context-aware tables — never generic placeholders. Add rows, delete, or edit directly in the interface.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <div className="font-semibold text-white text-[14px] mb-1">{title}</div>
                      <div className="text-white/50 text-[13px] leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="serif text-[28px] text-white mb-3">Frequently Asked Questions</h2>
              <div className="w-10 h-px bg-indigo-500/40 mb-5" />
              <div className="space-y-4">
                {[
                  {
                    q: 'Is my data sent to a server for document creation?',
                    a: 'No. DocReplacer is a fully client-side application. While the text is generated via an AI endpoint, the actual construction, formatting, and zipping of the .docx file happens locally on your device.',
                  },
                  {
                    q: 'Can I change the formatting of the generated document?',
                    a: 'Yes. The Global Style Settings menu allows you to adjust font families, text sizes, alignments, line spacing, margin sizes (Normal, Narrow, Moderate, Wide), and table aesthetics before you build the file.',
                  },
                  {
                    q: 'Will the .docx file work in standard word processors?',
                    a: 'Absolutely. DocReplacer surgically builds valid Open XML documents (word/document.xml), ensuring 100% compatibility with Microsoft Word, Google Docs, and LibreOffice without breaking layouts.',
                  },
                  {
                    q: 'Do I need an account to use DocReplacer?',
                    a: 'No. DocReplacer is built on a utility-first model. There are no complex onboarding steps — just open the app, enter your prompt, and generate your file.',
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <h3 className="font-bold text-white text-[15px] mb-2">{q}</h3>
                    <p className="text-white/55 text-[14px] leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center">
            <h3 className="font-bold text-white text-[18px] mb-2">Ready to get started?</h3>
            <p className="text-white/50 mb-5 text-[14px]">No account needed. Just open DocReplacer and go.</p>
            <Link to="/app" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-[14px] transition-all">
              Open DocReplacer
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}