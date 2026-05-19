import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPublishedBlogs, trackPageView } from '../firebase';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('/blog');
    getPublishedBlogs().then(data => {
      setBlogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog — DocReplacer | AI Document Tips &amp; Guides</title>
        <meta name="description" content="Read expert guides, tips, and tutorials about AI-powered document creation, Word file generation, and productivity — from the DocReplacer team." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://docreplacer.online/blog" />
        <meta property="og:title" content="Blog — DocReplacer" />
        <meta property="og:description" content="Expert guides and tutorials on AI document creation." />
        <meta property="og:url" content="https://docreplacer.online/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{ minHeight: '100vh', background: '#080810', color: 'white', fontFamily: "'IBM Plex Sans', sans-serif", overflowX: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .syne { font-family: 'Syne', sans-serif; }
          .mono { font-family: 'IBM Plex Mono', monospace; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          .blog-card {
            display: block; text-decoration: none; color: inherit;
            padding: 28px 32px; border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.025);
            transition: border-color 0.2s, transform 0.2s, background 0.2s;
            animation: fadeUp 0.45s both;
          }
          .blog-card:hover { border-color: rgba(99,102,241,0.35); transform: translateY(-2px); background: rgba(99,102,241,0.04); }
          .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #080810; }
          ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 4px; }
        `}</style>

        {/* Ambient bg */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', filter: 'blur(90px)' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.018 }}>
            <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'white' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect width="26" height="26" rx="7" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
              <rect x="6" y="7" width="14" height="2" rx="1" fill="#818cf8" />
              <rect x="6" y="12" width="10" height="2" rx="1" fill="#818cf8" opacity=".6" />
              <rect x="6" y="17" width="12" height="2" rx="1" fill="#818cf8" opacity=".35" />
            </svg>
            <span className="syne" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>DocReplacer</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/blog" style={{ fontSize: 13, color: 'rgba(129,140,248,0.9)', textDecoration: 'none', fontWeight: 600 }}>Blog</Link>
            <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 999, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none', boxShadow: '0 0 18px rgba(99,102,241,0.3)' }}>
              Launch App
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header style={{ position: 'relative', zIndex: 10, maxWidth: 780, margin: '0 auto', padding: '52px 24px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', marginBottom: 20 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="2" stroke="#818cf8" strokeWidth="1.2" /><path d="M3 4h4M3 6h2.5" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" /></svg>
            <span className="mono" style={{ fontSize: 9, color: 'rgba(129,140,248,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>DocReplacer Blog</span>
          </div>
          <h1 className="syne" style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.1 }}>
            Guides, Tips &{' '}
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Insights</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 16, lineHeight: 1.7, fontWeight: 300 }}>
            Expert articles on AI document creation, productivity, and Word file workflows.
          </p>
        </header>

        {/* Blog list */}
        <main style={{ position: 'relative', zIndex: 10, maxWidth: 780, margin: '0 auto', padding: '0 24px 96px' }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ padding: '28px 32px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 22, width: '80%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 10, width: '40%' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && blogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.25 }}>
                <rect x="8" y="8" width="40" height="40" rx="10" stroke="white" strokeWidth="1.5" />
                <path d="M18 20h20M18 28h14M18 36h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 15 }}>No posts published yet. Check back soon.</p>
            </div>
          )}

          {!loading && blogs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {blogs.map((blog, idx) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="blog-card"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                  aria-label={`Read: ${blog.title}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      {blog.category && (
                        <span className="mono" style={{ fontSize: 9, color: 'rgba(129,140,248,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginBottom: 10 }}>
                          {blog.category}
                        </span>
                      )}
                      <h2 className="syne" style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'white', marginBottom: 8, lineHeight: 1.35 }}>
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, fontWeight: 300, marginBottom: 14 }}>
                          {blog.excerpt}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {blog.publishedAt && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                            {formatDate(blog.publishedAt)}
                          </span>
                        )}
                        {blog.readTime && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>· {blog.readTime} min read</span>
                        )}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 4, opacity: 0.35 }}>
                      <path d="M4 10h12M10 4l6 6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.04)', padding: '20px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
              <rect width="26" height="26" rx="7" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
              <rect x="6" y="7" width="14" height="2" rx="1" fill="#818cf8" />
              <rect x="6" y="12" width="10" height="2" rx="1" fill="#818cf8" opacity=".6" />
              <rect x="6" y="17" width="12" height="2" rx="1" fill="#818cf8" opacity=".35" />
            </svg>
            <span className="syne" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>DocReplacer</span>
          </Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>100% client-side · Free forever</span>
        </footer>
      </div>
    </>
  );
}
