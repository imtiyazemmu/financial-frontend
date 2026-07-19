'use client';


import { getPostBySlug, getAllPosts } from '@/lib/api';
import { Post } from '@/lib/api';
import Link from 'next/link';
import PostShareButtons from '@/components/PostShareButtons';
import CommentSection from '@/components/CommentSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Inter } from 'next/font/google';

// ✅ Google Font
const inter = Inter({ subsets: ['latin'] });

// ✅ ISR – 10 सेकंड Revalidation
export const revalidate = 10;

// ---------- Helpers ----------
function getReadingTime(content: string) {
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200);
}

function extractHeadings(content: string) {
  const headings: { level: number; text: string; id: string }[] = [];
  const regex = /<h([1-6])>(.*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) headings.push({ level, text, id: `heading-${headings.length}` });
  }
  return headings;
}

// ✅ Client Component – `styled-jsx` के लिए
'use client';

function BlogContentClient({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const readingTime = getReadingTime(content);

  return (
    <>
      {/* Table of Contents */}
      {headings.length > 2 && (
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 rounded-2xl border border-blue-100/50 mb-8 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Table of Contents
          </h3>
          <ul className="mt-3 space-y-1.5">
            {headings.map((h, idx) => (
              <li key={idx} style={{ marginLeft: `${(h.level - 1) * 1.2}rem` }}>
                <a
                  href={`#${h.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reading Time + Word Count */}
      <div className="flex items-center gap-5 text-sm text-gray-500 mb-8 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50">
        <span className="flex items-center gap-1.5">📖 {readingTime} min read</span>
        <span className="w-px h-4 bg-gray-300" />
        <span className="flex items-center gap-1.5">📝 {content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} words</span>
      </div>

      {/* Main Content */}
      <div
        className={`blog-content ${inter.className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style jsx>{`
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #1e293b;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          scroll-margin-top: 100px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.3;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content h1 {
          font-size: 2.8rem;
          background: linear-gradient(135deg, #1e293b, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .blog-content h2 {
          font-size: 2.2rem;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.4rem;
        }
        .blog-content h3 {
          font-size: 1.7rem;
          color: #1e293b;
        }
        .blog-content h4 {
          font-size: 1.3rem;
          color: #334155;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: #334155;
        }
        .blog-content ul,
        .blog-content ol {
          margin-left: 1.8rem;
          margin-bottom: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          color: #334155;
        }
        .blog-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
          font-weight: 500;
        }
        .blog-content a:hover {
          color: #1d4ed8;
        }
        .blog-content img {
          border-radius: 16px;
          margin: 2rem 0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transition: transform 0.2s ease;
        }
        .blog-content img:hover {
          transform: scale(1.01);
        }
        .blog-content blockquote {
          border-left: 5px solid #3b82f6;
          padding-left: 1.8rem;
          padding-top: 0.8rem;
          padding-bottom: 0.8rem;
          margin: 1.8rem 0;
          background: linear-gradient(to right, #f8fafc, #ffffff);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #475569;
        }
        .blog-content code {
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
          color: #b91c1c;
        }
        .blog-content pre {
          background: #0f172a;
          padding: 1.2rem;
          border-radius: 14px;
          overflow-x: auto;
          margin: 1.8rem 0;
          color: #e2e8f0;
          font-size: 0.9rem;
        }
        .blog-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.8rem 0;
        }
        .blog-content th,
        .blog-content td {
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1rem;
          text-align: left;
        }
        .blog-content th {
          background: #f1f5f9;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}

// ---------- SEO Metadata ----------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  const plainDesc = post.meta_description ? post.meta_description.replace(/<[^>]+>/g, '') : post.content.replace(/<[^>]+>/g, '').substring(0, 155);
  return {
    title: post.meta_title || post.title,
    description: plainDesc,
    openGraph: {
      title: post.meta_title || post.title,
      description: plainDesc,
      images: post.featured_image ? [post.featured_image] : [],
      type: 'article',
      publishedTime: post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: plainDesc,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

// ---------- ISR ----------
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// ---------- Main Component ----------
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center"><h1 className="text-4xl font-bold text-gray-800">404</h1><p className="text-gray-600 mt-2">Post not found</p></div>
      </div>
    );
  }

  // Related Posts
  let relatedPosts: Post[] = [];
  if (post.categories && post.categories.length > 0) {
    const allPosts = await getAllPosts();
    relatedPosts = allPosts.filter((p): p is Post => {
      if (p.id === post.id) return false;
      if (!p.categories || p.categories.length === 0) return false;
      return post.categories.some(cat => p.categories.includes(cat));
    });
    relatedPosts = relatedPosts.slice(0, 3);
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description ? post.meta_description.replace(/<[^>]+>/g, '') : post.content.replace(/<[^>]+>/g, '').substring(0, 155),
    "image": post.featured_image || "https://via.placeholder.com/800x400",
    "author": { "@type": "Person", "name": "Financial Expert" },
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "publisher": { "@type": "Organization", "name": "FinanceTips" }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <span className="text-gray-300">›</span>
            <Link href="/blog" className="hover:text-blue-600 transition">Blog</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium truncate">{post.title}</span>
          </nav>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <span className="bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-semibold">
              {post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'General'}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">{post.created_at}</span>
          </div>

          {/* Content */}
          <BlogContentClient content={post.content} />

          {/* Share Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <PostShareButtons slug={post.slug} title={post.title} />
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              📘
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">Financial Expert</p>
              <p className="text-sm text-gray-500">Personal Finance & Govt Schemes Specialist</p>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-blue-500 rounded-full" />
                You May Also Like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map(p => (
                  <Link
                    href={`/blog/${p.slug}`}
                    key={p.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-5">
                      <h4 className="font-semibold text-blue-600 group-hover:text-blue-800 transition line-clamp-2">
                        {p.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-2">{p.created_at}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="mt-16">
            <CommentSection slug={post.slug} postId={post.id} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}