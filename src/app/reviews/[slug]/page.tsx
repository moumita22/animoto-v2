import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import InteractiveBackground from '@/components/InteractiveBackground';
import { Star, ArrowLeft, Lightbulb, Globe, User, Film, Sparkles, Play } from 'lucide-react';
import { renderMarkdown } from '@/lib/markdown';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Dynamic SEO Metadata: "Review and Learning from movie_name"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await prisma.movieReview.findUnique({
    where: { slug },
  });

  if (!movie) {
    return {
      title: 'Review Not Found | Animoto',
    };
  }

  const pageTitle = `Review and Learning from ${movie.title}`;
  const pageDescription = `In-depth review, critical analysis, and key learnings from ${movie.title} (${movie.year}), directed by ${movie.director}. Score: ${movie.rating}/10.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [movie.backdropUrl || movie.posterUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [movie.backdropUrl || movie.posterUrl],
    },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params;

  const session = await getAdminSession();
  const isAdmin = session.authenticated;

  const movie = await prisma.movieReview.findUnique({
    where: { slug },
  });

  if (!movie) {
    notFound();
  }

  // Unpublished drafts are only visible to authenticated admins
  if (!movie.published && !isAdmin) {
    notFound();
  }

  // Parse lessons safely
  let lessons: string[] = [];
  try {
    lessons = JSON.parse(movie.lifeLessons);
  } catch {
    lessons = movie.lifeLessons ? [movie.lifeLessons] : [];
  }

  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

  // Google Structured Data (JSON-LD) for Star Rating Rich Snippet
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: movie.title,
      dateCreated: movie.year.toString(),
      director: {
        '@type': 'Person',
        name: movie.director,
      },
      image: movie.posterUrl,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: movie.rating.toString(),
      bestRating: '10',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: 'Animoto Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Animoto',
    },
    description: movie.synopsis,
    ...(trailerEmbedUrl && {
      video: {
        '@type': 'VideoObject',
        name: `${movie.title} Official Trailer`,
        description: `Official trailer for ${movie.title}`,
        thumbnailUrl: [movie.backdropUrl || movie.posterUrl],
        embedUrl: trailerEmbedUrl,
        uploadDate: `${movie.year}-01-01T00:00:00Z`,
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-x-hidden">
      {/* Inject Google Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Floating Glowing Cinema Balls with Firecracker Click Bursts 💥 */}
      <InteractiveBackground />

      {/* Admin Draft Preview Notice */}
      {!movie.published && (
        <div className="relative z-30 bg-amber-500 text-zinc-950 font-black text-xs sm:text-sm px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
          <span>⚠️ DRAFT PREVIEW: This review is UNPUBLISHED and hidden from the public. Visible only to you as Admin.</span>
          <Link href="/admin" className="underline font-bold hover:text-white ml-2">
            Back to Dashboard
          </Link>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />

      <main className="flex-1">
        
        {/* BIG VISIBLE CRISP CINEMATIC BACKDROP IMAGE */}
        <section className="relative w-full aspect-[21/9] min-h-[420px] sm:min-h-[520px] bg-zinc-950 overflow-hidden">
          
          {/* 100% Brightness & Zero Blur Image */}
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={`Review and Learning from ${movie.title}`}
            className="w-full h-full object-cover object-center"
          />

          {/* Soft Bottom-Only Gradient for Text Readability */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#fbfbfa] dark:from-[#090a0f] via-zinc-950/70 to-transparent pointer-events-none" />

          {/* Top Back button */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-zinc-950/80 backdrop-blur-md text-zinc-200 hover:text-white border border-zinc-700/60 shadow-xl hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Reviews
            </Link>
          </div>

          {/* Title & Metadata Sitting at the Bottom */}
          <div className="absolute bottom-6 left-0 right-0 z-20 max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-zinc-950 shadow">
                {movie.genre}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                <Globe className="w-3.5 h-3.5" />
                {movie.language}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-zinc-200 border border-zinc-700/60">
                {movie.year}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-lg">
              Review and Learning from {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-200">
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs shadow-md">
                <Star className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                <span>{movie.rating.toFixed(1)} / 10 Score</span>
              </div>
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Directed by {movie.director}
              </span>
            </div>
          </div>
        </section>

        {/* Content Body Layout */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          
          {/* Top Banner Ad */}
          <AdBanner slot="review-top" format="horizontal" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
            
            {/* Left 2 Columns: Review & Learnings */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Plot & Critical Review (Formatted with Markdown: Bold, Italic, Underline) */}
              <article className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
                <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-500" />
                  Review &amp; Cinematic Analysis
                </h2>
                <div
                  className="markdown-content text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(movie.synopsis),
                  }}
                />
              </article>

              {/* Official Movie Trailer */}
              {trailerEmbedUrl && (
                <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                      <Play className="w-5 h-5 text-amber-500 fill-amber-500" />
                      Official Trailer
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      HD Preview
                    </span>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-zinc-200 dark:border-zinc-800">
                    <iframe
                      src={trailerEmbedUrl}
                      title={`${movie.title} Official Trailer`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </section>
              )}

              {/* In-Article Mid Ad */}
              <AdBanner slot="review-mid" format="horizontal" label="Advertisement" />

              {/* Key Learnings & Takeaways Section */}
              <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white/70 dark:from-amber-500/15 dark:via-zinc-900/80 dark:to-transparent border border-amber-500/30 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30">
                    <Lightbulb className="w-6 h-6 fill-zinc-950" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                      Key Learnings &amp; Takeaways
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Core wisdom extracted from {movie.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3.5 shadow-2xs hover:border-amber-500/50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                      <div
                        className="markdown-content text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(lesson),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Bottom Ad */}
              <AdBanner slot="review-bottom" format="horizontal" />

            </div>

            {/* Right Sidebar: Tall Poster Card + Quick Verdict */}
            <aside className="space-y-6">
              
              {/* Sticky Movie Poster Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-md sticky top-24">
                <div className="rounded-2xl overflow-hidden aspect-[2/3] bg-zinc-950 mb-2 shadow-xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mb-4 leading-tight">
                  Poster © by respective rights holders. Used under{' '}
                  <Link href="/terms#fair-use" className="underline hover:text-amber-500">
                    Fair Use (17 U.S.C. § 107)
                  </Link>.
                </p>

                <h3 className="font-black text-xl text-zinc-900 dark:text-white text-center mb-1">
                  {movie.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-4">
                  {movie.genre} • {movie.year}
                </p>

                {/* Score badge big */}
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {movie.rating.toFixed(1)} / 10
                  </span>
                </div>

                {/* Quick Info Grid */}
                <div className="text-xs space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-400">Director</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{movie.director}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-400">Language</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{movie.language}</span>
                  </div>
                </div>

                {/* Sidebar Ad Slot */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <AdBanner slot="sidebar-display" format="rectangle" />
                </div>

              </div>

            </aside>

          </div>

        </div>

      </main>

        <Footer />
      </div>
    </div>
  );
}
