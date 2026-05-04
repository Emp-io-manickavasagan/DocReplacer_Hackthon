import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Sparkles, Tag } from 'lucide-react';

const BLOGS = [
  {
    id: 'prompt-to-docx',
    slug: 'turn-any-prompt-into-formatted-docx',
    title: 'Turn Any Prompt Into a Formatted .docx — No Login, Runs in Your Browser',
    subtitle: 'Built DocReplacer to eliminate the copy-paste-reformat loop between AI tools and Word.',
    date: 'May 2026',
    readTime: '6 min read',
    tags: ['AI', 'Productivity', 'DOCX', 'No-Code'],
    excerpt: 'You prompt, it builds a structured .docx with headers, tables, and bullet points — instantly. No account. No server. No subscription. 100% client-side.',
    content: `
      <h2>The Problem Nobody Talks About</h2>
      <p>Every day, millions of people use ChatGPT, Claude, Gemini — and then spend the next 20 minutes copy-pasting that output into Microsoft Word, fixing broken formatting, re-adding headers, rebuilding tables, adjusting fonts. It's a hidden tax on every AI-powered workflow.</p>
      <p>AI gives you brilliant content. Word gives you a blank page. The bridge between them? Manual labor.</p>
      <p>That loop — <strong>prompt → copy → paste → reformat → cry → repeat</strong> — is exactly what DocReplacer was built to destroy.</p>

      <h2>What DocReplacer Actually Does</h2>
      <p>DocReplacer is a free, browser-based tool that converts your plain text prompt directly into a fully structured <code>.docx</code> file — complete with:</p>
      <ul>
        <li><strong>Proper heading hierarchy</strong> (H1, H2, H3 — not just bold text)</li>
        <li><strong>Formatted tables</strong> with real borders and cell alignment</li>
        <li><strong>Bullet and numbered lists</strong> that Word actually recognizes as lists</li>
        <li><strong>Font consistency</strong> across the entire document</li>
        <li><strong>Paragraph spacing</strong> that doesn't need manual fixing</li>
      </ul>
      <p>You describe what you want. It generates the document. You download it. Done.</p>

      <h2>Why 100% Client-Side Matters</h2>
      <p>Most "free" document tools are free until they're not. They require an account to download. They process your data on their servers. They offer 3 free exports then ask for a credit card.</p>
      <p>DocReplacer runs entirely in your browser. Your prompt never leaves your device. There's no backend processing your text, no database storing your documents, no account to create, no subscription to cancel.</p>
      <p>The entire tool is JavaScript running locally. Open the page. Use it. Close it. That's the entire relationship.</p>

      <h2>The Real Use Cases</h2>
      <p>Here's what people are actually using it for:</p>
      <ul>
        <li><strong>College reports & assignments</strong> — Prompt your research, get a structured report doc instantly</li>
        <li><strong>Business proposals</strong> — Describe your offer, get a formatted proposal ready for client delivery</li>
        <li><strong>SOPs and documentation</strong> — Turn bullet notes into a proper process document</li>
        <li><strong>Meeting minutes</strong> — Feed in notes, get a clean formatted document back</li>
        <li><strong>Technical specifications</strong> — Structure your requirements doc with proper hierarchy</li>
        <li><strong>Resume drafts</strong> — Generate Word-native formatted resume layouts</li>
      </ul>

      <h2>How It Compares to Just Using AI + Word</h2>
      <table>
        <thead>
          <tr><th>Workflow</th><th>Time</th><th>Formatting</th><th>Privacy</th></tr>
        </thead>
        <tbody>
          <tr><td>AI → Copy → Word</td><td>15–25 min</td><td>Manual fix</td><td>AI has data</td></tr>
          <tr><td>DocReplacer</td><td>Under 1 min</td><td>Auto-structured</td><td>Local only</td></tr>
        </tbody>
      </table>

      <h2>The Technical Approach (For the Curious)</h2>
      <p>A <code>.docx</code> file is actually a ZIP archive containing XML files. Most tools that "export to Word" generate HTML and let Word import it — which is why the formatting always breaks. DocReplacer writes native <code>document.xml</code> directly, meaning the output is genuine OOXML that Word reads as its own format — not a converted HTML approximation.</p>
      <p>This is why headers are real headers. Tables are real tables. Lists are real lists. The document behaves like a document from the start, not like a web page wearing a Word costume.</p>

      <h2>SEO & GEO Visibility Note</h2>
      <p>If you're searching for: <em>AI to Word document generator</em>, <em>prompt to docx free</em>, <em>generate formatted Word file from text</em>, <em>no login document generator AI</em>, <em>free DOCX generator browser</em> — this is that tool.</p>
      <p>DocReplacer is indexed, free, requires no account, and works on any device with a modern browser. Mobile included.</p>

      <h2>Try It Now</h2>
      <p>No signup. No waitlist. No trial period. Just open the tool and start generating documents.</p>
      <p><strong>→ <a href="https://www.docreplacer.online" target="_blank" rel="noopener noreferrer">docreplacer.online</a></strong></p>
      <p>If it saves you even 10 minutes today, that's already worth it.</p>
    `
  },
  {
    id: 'docreplacer-origin',
    slug: 'how-docreplacer-was-born-from-a-real-problem',
    title: 'How DocReplacer Was Born From a Real Problem (Not a Trend)',
    subtitle: 'A semester project nightmare, broken DOCX templates, and one idea that finally worked.',
    date: 'May 2026',
    readTime: '4 min read',
    tags: ['Story', 'SaaS', 'Building in Public', 'DocReplacer'],
    excerpt: 'Most SaaS ideas come from market research. This one came from a specific, painful moment with a college DOCX template that destroyed three hours of work.',
    content: `
      <h2>The Nightmare That Started Everything</h2>
      <p>It started with a semester project. The kind every engineering student knows — the college provides a template, you copy your content into it, and somehow the entire formatting collapses the moment you paste anything in.</p>
      <p>Fonts change. Spacing breaks. Headers lose their hierarchy. The table of contents points to the wrong pages. You spend more time fixing the format than writing the actual project.</p>
      <p>One night, after watching a carefully formatted document turn into visual chaos for the third time, the thought hit: <em>why is editing an existing DOCX this painful?</em></p>

      <h2>The First Attempt — Editing XML Directly</h2>
      <p>A <code>.docx</code> file is actually a ZIP archive containing XML. If you unzip it, the main content lives in <code>word/document.xml</code>. The first version of DocReplacer did exactly that — unzip the file, parse the XML, find-and-replace content while keeping the surrounding formatting intact, re-zip it.</p>
      <p>It worked. Imperfectly, but it worked. The formatting survived. The template stayed intact. Students could update their content without breaking the structure.</p>
      <p>That version launched on Product Hunt. It didn't take off — but it proved the core idea was real.</p>

      <h2>The Pivot That Changed Everything</h2>
      <p>After sitting with the feedback (and the silence), a better question emerged: <em>why edit an existing document at all?</em></p>
      <p>If the underlying problem is that AI output doesn't translate cleanly into Word format — why not skip the middle step entirely? Why not go directly from prompt to properly structured DOCX?</p>
      <p>That reframe became the second — and current — version of DocReplacer.</p>
      <p>Instead of modifying XML, it now <strong>generates</strong> it. You describe what you want. The tool writes native OOXML — real headers, real tables, real paragraph styles — and packages it as a proper <code>.docx</code> file your browser downloads directly.</p>
      <p>No server. No conversion layer. No formatting breakage.</p>

      <h2>Six Months to a Working Product</h2>
      <p>The rebuild started December 2025. The MVP finished May 2026. Six months of working through complex XML alignment issues, edge cases in table rendering, heading hierarchy bugs, and the specific pain of generating bullet lists that Word actually recognizes as native lists — not styled paragraphs pretending to be lists.</p>
      <p>The current version is the most solid thing built so far. It handles real documents, not toy examples.</p>

      <h2>Why This Idea Has Legs</h2>
      <p>The problem DocReplacer solves isn't niche. It sits at the intersection of two massive behaviors: <strong>everyone using AI to generate content</strong>, and <strong>everyone still needing that content in Word format</strong>. Those two facts aren't going away. If anything, the gap between AI output and professional document delivery is getting more obvious as AI usage grows.</p>
      <p>Client-side, no-login, free tools also have a specific advantage: they remove every friction point that causes people to close the tab before they see value. There's nothing to sign up for. Nothing to lose. The tool just works.</p>

      <h2>Where It Stands Now</h2>
      <p>DocReplacer is live, free, and fully functional at <a href="https://www.docreplacer.online" target="_blank" rel="noopener noreferrer">docreplacer.online</a>. No login. No subscription. 100% client-side. The distribution is still early — but the product works, and the problem is real.</p>
      <p>That's a better starting point than most ideas ever reach.</p>
    `
  }
];

function BlogCard({ post, onClick }) {
  return (
    <article
      onClick={() => onClick(post)}
      className="group cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/20 rounded-2xl p-6 md:p-8 transition-all duration-300"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
            <Tag className="w-2.5 h-2.5" />{tag}
          </span>
        ))}
      </div>
      <h2 className="serif text-xl md:text-2xl text-white leading-tight mb-3 group-hover:text-indigo-200 transition-colors">
        {post.title}
      </h2>
      <p className="text-white/40 text-sm leading-relaxed mb-6">{post.excerpt}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/30 text-xs">
          <span>{post.date}</span>
        </div>
        <span className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold group-hover:gap-2.5 transition-all">
          Read article <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
}

function BlogPost({ post, onBack }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-20">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Blog
      </button>

      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
            <Tag className="w-2.5 h-2.5" />{tag}
          </span>
        ))}
      </div>

      <h1 className="serif text-[32px] md:text-[48px] text-white leading-tight mb-4">
        {post.title}
      </h1>
      <p className="text-white/50 text-lg mb-6">{post.subtitle}</p>
      <div className="flex items-center gap-4 text-white/30 text-xs mb-12 pb-12 border-b border-white/[0.06]">
        <span>{post.date}</span>
      </div>

      <div
        className="blog-content text-white/70 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}

export default function BlogPage() {
  const [activePost, setActivePost] = useState(null);

  const pageTitle = activePost
    ? `${activePost.title} | DocReplacer Blog`
    : 'Blog | DocReplacer - AI Word Document Generator';

  const pageDesc = activePost
    ? activePost.excerpt
    : 'Insights on AI document generation, DOCX workflows, and building DocReplacer. Free browser-based tool to turn prompts into formatted Word documents.';

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden flex flex-col items-center">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        {activePost && <link rel="canonical" href={`https://www.docreplacer.online/blog/${activePost.slug}`} />}
        {!activePost && <link rel="canonical" href="https://www.docreplacer.online/blog" />}
        {/* OG */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content={activePost ? 'article' : 'website'} />
        <meta property="og:url" content={activePost ? `https://www.docreplacer.online/blog/${activePost.slug}` : 'https://www.docreplacer.online/blog'} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        {/* Schema */}
        {activePost && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": activePost.title,
            "description": activePost.excerpt,
            "datePublished": "2026-05-01",
            "publisher": { "@type": "Organization", "name": "DocReplacer", "url": "https://www.docreplacer.online" },
            "url": `https://www.docreplacer.online/blog/${activePost.slug}`
          })}</script>
        )}
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .serif { font-family: 'DM Serif Display', serif; }
        .brand-font { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        
        .floating { animation: float 6s ease-in-out infinite; }
        .pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }

        .blog-content h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: rgba(255,255,255,0.95);
          margin: 2.5rem 0 1rem;
          line-height: 1.3;
        }
        .blog-content p {
          margin-bottom: 1.2rem;
          font-size: 1rem;
          line-height: 1.8;
        }
        .blog-content ul, .blog-content ol {
          margin: 1rem 0 1.5rem 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          line-height: 1.7;
        }
        .blog-content strong { color: rgba(255,255,255,0.9); }
        .blog-content code {
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.2);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          color: #a5b4fc;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .blog-content a {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-content a:hover { color: #c084fc; }
        .blog-content em { color: rgba(255,255,255,0.6); }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
        .blog-content th {
          background: rgba(129,140,248,0.1);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.6rem 1rem;
          text-align: left;
          color: rgba(255,255,255,0.8);
          font-weight: 600;
        }
        .blog-content td {
          border: 1px solid rgba(255,255,255,0.06);
          padding: 0.6rem 1rem;
          color: rgba(255,255,255,0.5);
        }
        .blog-content tr:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <main className="relative z-10 w-full flex-1">
        {activePost ? (
          <BlogPost post={activePost} onBack={() => setActivePost(null)} />
        ) : (
          <div className="w-full max-w-4xl mx-auto px-6 py-20">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-sm font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[12px] font-semibold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                DocReplacer Blog
              </div>
              <h1 className="serif text-[40px] md:text-[60px] text-white leading-tight mb-4">
                Articles on <span className="italic text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc)' }}>AI & Docs</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xl">
                Thoughts on document generation, AI productivity workflows, and building DocReplacer.
              </p>
            </div>

            {/* Blog cards */}
            <div className="flex flex-col gap-6">
              {BLOGS.map(post => (
                <BlogCard key={post.id} post={post} onClick={setActivePost} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-8 flex justify-center border-t border-white/[0.03] mt-auto">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="w-6 h-6 rounded-lg bg-[#c7cbe8] flex items-center justify-center p-1 shadow-sm">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-full h-full object-contain" />
          </div>
          <span className="brand-font text-[14px] text-white/80">DocReplacer Blog</span>
        </div>
      </footer>
    </div>
  );
}