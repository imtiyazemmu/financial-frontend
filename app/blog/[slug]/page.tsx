import { getPostBySlug, getAllPosts } from '@/lib/api';
import { Post } from '@/lib/api';
import Link from 'next/link';
import PostShareButtons from '@/components/PostShareButtons';
import CommentSection from '@/components/CommentSection';
import BlogContent from '@/components/BlogContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const revalidate = 10;

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

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

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
      <main className={`min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white ${inter.className}`}>
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-fade-in-up">
            <Link href="/" className="hover:text-blue-600 transition-colors">🏠 Home</Link>
            <span className="text-gray-300">›</span>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">📝 Blog</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium truncate">{post.title}</span>
          </nav>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-72 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl mb-10 pulse-glow">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight animate-fade-in-up">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <span className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-200/30">
              {post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'General'}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.created_at}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.ceil(post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200)} min read
            </span>
          </div>

          {/* Content Card */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-white/50 card-advance">
            <BlogContent content={post.content} />
          </div>

          {/* Share Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <PostShareButtons slug={post.slug || slug} title={post.title} />
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 rounded-2xl border border-blue-100/50 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
              📘
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-800 text-lg">Financial Expert</p>
              <p className="text-sm text-gray-500">Personal Finance & Govt Schemes Specialist</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📊 5+ Years</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">🏆 SEBI Registered</span>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-emerald-400 rounded-full"></span>
                📌 You May Also Like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((p) => (
                  <Link
                    href={`/blog/${p.slug}`}
                    key={p.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-5">
                      <h4 className="font-semibold text-blue-600 group-hover:text-blue-800 transition line-clamp-2 text-base">
                        {p.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-2">{p.created_at}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-16">
            <CommentSection slug={slug} postId={post.id} />
          </div>

        </article>
      </main>
      <Footer />
    </>
  );
}