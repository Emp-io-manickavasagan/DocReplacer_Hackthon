import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBlogBySlug, trackPageView } from '../firebase';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    trackPageView(`/blog/${slug}`);
    getBlogBySlug(slug).then(data => {
      if (!data) setNotFound(true);
      else setPost(data);
      setLoading(false);
    });
  }, [slug]);

  const canonicalUrl = `https://docreplacer.online/blog/${slug}`;

  return (
    <>
      {post && (
        <Helmet>
          <title>{post.title} — DocReplacer Blog</title>
          <meta name="description" content={post.excerpt || post.title} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt || ''} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="article" />
          {post.publishedAt && (
            <meta property="article:published_time" content={
              post.publishedAt.toDate ? post.publishedAt.toDate().toISOString() : new Date(post.publishedAt).toISOString()
            } />
          )}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt || '',
            "url": canonicalUrl,
            "datePublished": post.publishedAt
              ? (post.publishedAt.toDate ? post.publishedAt.toDate().toISOString() : new Date(post.publishedAt).toISOString())
              : '',
            "author": { "@type": "Organization", "name": "DocReplacer" },
            "publisher": { "@type": "Organization", "name": "DocReplacer", "url": "https://docreplacer.online" }
          })}</script>
        </Helmet>
      )}

      <div style={{ minHeight: '100vh', background: '#080810', color: 'white', fontFamily: "'IBM Plex Sans', sans-serif", overflowX: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .syne { font-family: 'Syne', sans-serif; }
          .mono { font-family: 'IBM Plex Mono', monospace; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }
          /* ── Blog content typography ── */
          .blog-content h1, .blog-content h2, .blog-content h3,
          .blog-content h4, .blog-content h5, .blog-content h6 {
            font-family: 'Syne', sans-serif; letter-spacing: -0.025em;
            color: #fff; margin: 2em 0 0.75em; line-height: 1.25;
          }
          .blog-content h1 { font-size: clamp(22px,4vw,36px); font-weight: 800; }
          .blog-content h2 { font-size: clamp(18px,3vw,28px); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
          .blog-content h3 { font-size: clamp(16px,2.5vw,22px); font-weight: 700; color: rgba(255,255,255,0.9); }
          .blog-content h4 { font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.8); }
          .blog-content p { font-size: 16px; line-height: 1.8; color: rgba(255,255,255,0.7); margin: 0 0 1.4em; font-weight: 300; }
          .blog-content ul, .blog-content ol { margin: 0 0 1.4em 1.5em; }
          .blog-content li { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.65); margin-bottom: 0.4em; font-weight: 300; }
          .blog-content strong { color: rgba(255,255,255,0.9); font-weight: 600; }
          .blog-content em { color: rgba(255,255,255,0.75); font-style: italic; }
          .blog-content a { color: #818cf8; text-decoration: underline; text-underline-offset: 3px; }
          .blog-content a:hover { color: #a78bfa; }
          .blog-content blockquote {
            border-left: 3px solid rgba(99,102,241,0.5);
            padding: 12px 0 12px 20px; margin: 1.6em 0;
            background: rgba(99,102,241,0.05); border-radius: 0 8px 8px 0;
          }
          .blog-content blockquote p { color: rgba(255,255,255,0.55); margin: 0; font-style: italic; }
          .blog-content code {
            font-family: 'IBM Plex Mono', monospace; font-size: 13px;
            background: rgba(99,102,241,0.12); color: #a78bfa;
            padding: 2px 7px; border-radius: 4px;
          }
          .blog-content pre {
            background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px; padding: 20px; overflow-x: auto; margin: 1.4em 0;
          }
          .blog-content pre code { background: none; color: rgba(255,255,255,0.75); padding: 0; font-size: 13px; }
          .blog-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 2.5em 0; }
          .blog-content img { max-width: 100%; border-radius: 10px; margin: 1.2em 0; }
          .blog-content table { width: 100%; border-collapse: collapse; margin: 1.4em 0; font-size: 14px; }
          .blog-content th, .blog-content td { padding: 10px 16px; border: 1px solid rgba(255,255,255,0.08); text-align: left; color: rgba(255,255,255,0.7); }
          .blog-content th { background: rgba(99,102,241,0.08); font-weight: 600; color: white; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #080810; }
          ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 4px; }
          @media (max-width: 640px) { .blog-content { padding: 0; } }
        `}</style>

        {/* Ambient bg */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', filter: 'blur(90px)' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
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
            <Link to="/blog" style={{ fontSize: 13, color: 'rgba(129,140,248,0.9)', textDecoration: 'none', fontWeight: 600 }}>← Blog</Link>
            <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 999, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none', boxShadow: '0 0 18px rgba(99,102,241,0.3)' }}>
              Launch App
            </Link>
          </div>
        </nav>

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 720, margin: '48px auto', padding: '0 24px' }}>
            <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 40, width: '85%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 48 }} />
            {[0.9, 0.8, 0.95, 0.75, 0.85].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 14, width: `${w * 100}%`, marginBottom: 12 }} />
            ))}
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.2 }}>
              <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="1.5" />
              <path d="M22 22l20 20M42 22L22 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Post Not Found</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 32 }}>The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none' }}>
              Back to Blog
            </Link>
          </div>
        )}

        {/* Article */}
        {!loading && post && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 96px', position: 'relative', zIndex: 10 }}>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: 28 }}>
              <ol style={{ display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', padding: 0 }}>
                <li><Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Home</Link></li>
                <li style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>›</li>
                <li><Link to="/blog" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Blog</Link></li>
                <li style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>›</li>
                <li style={{ fontSize: 12, color: 'rgba(129,140,248,0.7)' }} aria-current="page">{post.title}</li>
              </ol>
            </nav>

            {/* Article header */}
            <article itemScope itemType="https://schema.org/BlogPosting">
              <header style={{ marginBottom: 40 }}>
                {post.category && (
                  <span className="mono" style={{ fontSize: 9, color: 'rgba(129,140,248,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginBottom: 14 }}>
                    {post.category}
                  </span>
                )}
                <h1 itemProp="headline" className="syne" style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p itemProp="description" style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, fontWeight: 300, marginBottom: 20 }}>
                    {post.excerpt}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 26 26" fill="none">
                        <rect x="6" y="7" width="14" height="2" rx="1" fill="white" />
                        <rect x="6" y="12" width="10" height="2" rx="1" fill="white" opacity=".7" />
                        <rect x="6" y="17" width="12" height="2" rx="1" fill="white" opacity=".4" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }} itemProp="author">DocReplacer</span>
                  </div>
                  {post.publishedAt && (
                    <time style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }} itemProp="datePublished" dateTime={post.publishedAt.toDate ? post.publishedAt.toDate().toISOString() : ''}>
                      {formatDate(post.publishedAt)}
                    </time>
                  )}
                  {post.readTime && (
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>{post.readTime} min read</span>
                  )}
                </div>
              </header>

              {/* Article Body */}
              <div className="prose prose-invert prose-indigo max-w-none text-[15px] sm:text-[16px] leading-[1.85] text-white/80">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-10 mb-4 text-white" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-white" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-white" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-6 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-6 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500/50 pl-5 py-1 mb-6 text-white/60 italic bg-white/[0.02] rounded-r-lg" {...props} />,
                    pre: ({node, ...props}) => <pre className="bg-[#080810] border border-white/10 rounded-xl p-4 mb-6 overflow-x-auto text-[13px] text-white/70 db-mono" {...props} />,
                    code: ({node, inline, ...props}) => inline ? <code className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded db-mono text-[0.9em]" {...props} /> : <code className="db-mono" {...props} />,
                    img: ({node, ...props}) => <img className="rounded-xl shadow-lg border border-white/10 my-8 max-w-full h-auto" loading="lazy" {...props} />,
                    iframe: ({node, ...props}) => <div className="aspect-video my-8"><iframe className="w-full h-full rounded-xl border border-white/10" loading="lazy" {...props} /></div>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {post.tags.map(tag => (
                      <span key={tag} className="mono" style={{ fontSize: 10, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: 'rgba(129,140,248,0.8)', letterSpacing: '0.06em', textTransform: 'lowercase' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </article>

            {/* CTA */}
            <div style={{ marginTop: 56, padding: '32px', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)', background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))', textAlign: 'center' }}>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Try DocReplacer Free</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontWeight: 300 }}>Generate fully-formatted Word documents from any prompt — right in your browser.</p>
              <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 999, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none' }}>
                Launch App →
              </Link>
            </div>

            {/* Back to blog */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Link to="/blog" style={{ fontSize: 13, color: 'rgba(129,140,248,0.7)', textDecoration: 'none' }}>← Back to all posts</Link>
            </div>
          </div>
        )}

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
