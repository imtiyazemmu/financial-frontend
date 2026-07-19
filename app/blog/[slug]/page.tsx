import { getPostBySlug, getAllPosts } from '@/lib/api';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

function BlogContentClient({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const readingTime = getReadingTime(content);

  return (
    <>
      {headings.length > 2 && (
        <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">📖 Table of Contents</h3>
          <ul className="mt-2 space-y-1">
            {headings.map((h, idx) => (
              <li key={idx} style={{ marginLeft: `${(h.level - 1) * 1.2}rem` }}>
                <a href={`#${h.id}`} className="text-blue-600 hover:underline text-sm">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
        <span className="flex items-center gap-1">🕒 {readingTime} min read</span>
        <span className="w-px h-4 bg-gray-300" />
        <span className="flex items-center gap-1">📝 {content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} words</span>
      </div>

      <div className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />

      <ShareButtons />

      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
          scroll-margin-top: 80px;
        }
        .blog-content h1 { font-size: 2.2rem; font-weight: 700; margin-top: 1.8rem; margin-bottom: 0.8rem; }
        .blog-content h2 { font-size: 1.8rem; font-weight: 600; margin-top: 1.6rem; margin-bottom: 0.6rem; }
        .blog-content h3 { font-size: 1.4rem; font-weight: 600; margin-top: 1.2rem; }
        .blog-content p { margin-bottom: 1.2rem; line-height: 1.8; color: #1f2937; }
        .blog-content ul, .blog-content ol { margin-left: 1.5rem; margin-bottom: 1.2rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { color: #1e3a8a; }
        .blog-content a { color: #2563eb; text-decoration: underline; }
        .blog-content img { border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .blog-content blockquote { border-left: 4px solid #3b82f6; padding-left: 1.2rem; color: #4b5563; font-style: italic; }
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

  // ✅ FIX: अब `categories` Array का उपयोग करें
  // Related Posts – same categories (अगर कोई category है)
  let relatedPosts: Awaited<ReturnType<typeof getPostBySlug>>[] = [];
  if (post.categories && post.categories.length > 0) {
    const allPosts = await getAllPosts();
    // फ़िल्टर करें: उसी categories में से एक भी category match हो
    relatedPosts = allPosts.filter((p) => {
      if (p.id === post.id) return false;
      if (!p.categories || p.categories.length === 0) return false;
      // Check if any category matches
      return post.categories.some(cat => p.categories.includes(cat));
    });
    // Limit to 3
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
      <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">{post.title}</span>
          </nav>

          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg mb-8" />
          )}
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500 border-b pb-6">
            <span className="bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              {post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'General'}
            </span>
            <span className="text-gray-300">|</span>
            <span>{post.created_at}</span>
          </div>

          <BlogContentClient content={post.content} />

          <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">📘</div>
            <div>
              <p className="font-bold text-gray-800">Financial Expert</p>
              <p className="text-sm text-gray-500">Personal Finance & Govt Schemes Specialist</p>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                You May Also Like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map(p => (
                  <Link href={`/blog/${p.slug}`} key={p.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
                    <h4 className="font-semibold text-blue-600 hover:underline line-clamp-2">{p.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{p.created_at}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}