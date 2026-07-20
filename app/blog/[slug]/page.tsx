import { getPostBySlug, getAllPosts } from '@/lib/api';
import { Post } from '@/lib/api';
import Link from 'next/link';
import PostShareButtons from '@/components/PostShareButtons';
import CommentSection from '@/components/CommentSection';
import BlogContent from '@/components/BlogContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Inter } from 'next/font/google';

// ✅ Google Font (Inter) – Modern & Readable
const inter = Inter({ subsets: ['latin'] });

// ✅ ISR – 10 सेकंड Revalidation
export const revalidate = 10;

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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="text-gray-600 mt-2">Post not found</p>
        </div>
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

  // JSON-LD Schema
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
      <main className={`min-h-screen bg-gradient-to-b from-white via-gray-50/40 to-white ${inter.className}`}>
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          
          {/* Schema Script */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          {/* 🍞 Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium truncate">{post.title}</span>
          </nav>

          {/* 🖼️ Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-10">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}

          {/* 📝 Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* 🏷️ Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <span className="bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-semibold">
              {post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'General'}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.created_at}
            </span>
          </div>

          {/* 📄 Content Card */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-gray-100/50">
            <BlogContent content={post.content} />
          </div>

          {/* 🔗 Share Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <PostShareButtons slug={post.slug || slug} title={post.title} />
          </div>

          {/* 👤 Author Bio */}
          <div className="mt-12 p-6 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
              📘
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-800 text-lg">Financial Expert</p>
              <p className="text-sm text-gray-500">Personal Finance & Govt Schemes Specialist</p>
            </div>
          </div>

          {/* 📌 Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
                You May Also Like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map(p => (
                  <Link
                    href={`/blog/${p.slug}`}
                    key={p.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
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

          {/* 💬 Comment Section */}
          <div className="mt-16">
            <CommentSection slug={slug} postId={post.id} />
          </div>

        </article>
      </main>
      <Footer />
    </>
  );
}