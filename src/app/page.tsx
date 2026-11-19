import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import MovieCard, { MovieItem } from '@/components/MovieCard';
import AdBanner from '@/components/AdBanner';
import InteractiveBackground from '@/components/InteractiveBackground';
import { Sparkles, Flame, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    language?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.trim() || '';
  const selectedGenre = resolvedParams.genre || '';
  const selectedLanguage = resolvedParams.language || '';
  const sortBy = resolvedParams.sort || 'latest';
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const pageSize = 12;
  const skip = (currentPage - 1) * pageSize;

  let movies: MovieItem[] = [];
  let totalCount = 0;

  try {
    if (q) {
      try {
        // Use PostgreSQL GIN Index for Full-Text Search with ranking
        let sql = `
          SELECT 
            id, title, slug, year, genre, language, director, rating,
            poster_url as "posterUrl", backdrop_url as "backdropUrl",
            trailer_url as "trailerUrl",
            synopsis, life_lessons as "lifeLessons", featured
          FROM movie_reviews
          WHERE published = true 
            AND (
              search_vector @@ plainto_tsquery('english', $1)
              OR title ILIKE $2
              OR director ILIKE $2
              OR genre ILIKE $2
              OR language ILIKE $2
            )
        `;
        let countSql = `
          SELECT COUNT(*)::int as total
          FROM movie_reviews
          WHERE published = true 
            AND (
              search_vector @@ plainto_tsquery('english', $1)
              OR title ILIKE $2
              OR director ILIKE $2
              OR genre ILIKE $2
              OR language ILIKE $2
            )
        `;
        const params: (string | number)[] = [q, `%${q}%`];
        const countParams: (string | number)[] = [q, `%${q}%`];

        if (selectedGenre) {
          params.push(`%${selectedGenre}%`);
          countParams.push(`%${selectedGenre}%`);
          sql += ` AND genre ILIKE $${params.length}`;
          countSql += ` AND genre ILIKE $${countParams.length}`;
        }
        if (selectedLanguage) {
          params.push(selectedLanguage);
          countParams.push(selectedLanguage);
          sql += ` AND language ILIKE $${params.length}`;
          countSql += ` AND language ILIKE $${countParams.length}`;
        }

        if (sortBy === 'rating') {
          sql += ` ORDER BY rating DESC, ts_rank(search_vector, plainto_tsquery('english', $1)) DESC`;
        } else {
          sql += ` ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC, rating DESC`;
        }

        // Get total count for pagination
        const countResult = await prisma.$queryRawUnsafe<[{ total: number }]>(countSql, ...countParams);
        totalCount = countResult[0]?.total || 0;

        // Apply LIMIT and OFFSET
        params.push(pageSize);
        sql += ` LIMIT $${params.length}`;
        params.push(skip);
        sql += ` OFFSET $${params.length};`;

        movies = await prisma.$queryRawUnsafe<MovieItem[]>(sql, ...params);
      } catch (sqlError) {
        console.warn('GIN full-text search fallback triggered:', sqlError);
        const fallbackWhere = {
          published: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { director: { contains: q, mode: 'insensitive' as const } },
            { genre: { contains: q, mode: 'insensitive' as const } },
            { language: { contains: q, mode: 'insensitive' as const } },
            { synopsis: { contains: q, mode: 'insensitive' as const } },
            { lifeLessons: { contains: q, mode: 'insensitive' as const } },
          ],
          ...(selectedGenre && { genre: { contains: selectedGenre, mode: 'insensitive' as const } }),
          ...(selectedLanguage && { language: { equals: selectedLanguage, mode: 'insensitive' as const } }),
        };

        totalCount = await prisma.movieReview.count({ where: fallbackWhere });
        movies = (await prisma.movieReview.findMany({
          where: fallbackWhere,
          orderBy: sortBy === 'rating' ? [{ rating: 'desc' }] : [{ createdAt: 'desc' }],
          take: pageSize,
          skip,
        })) as unknown as MovieItem[];
      }
    } else {
      // Standard query with filtering
      const where: Prisma.MovieReviewWhereInput = { published: true };
      if (selectedGenre) {
        where.genre = { contains: selectedGenre, mode: 'insensitive' };
      }
      if (selectedLanguage) {
        where.language = { equals: selectedLanguage, mode: 'insensitive' };
      }

      totalCount = await prisma.movieReview.count({ where });

      const orderBy: Prisma.MovieReviewOrderByWithRelationInput[] = [];
      if (sortBy === 'rating') {
        orderBy.push({ rating: 'desc' });
      } else {
        orderBy.push({ featured: 'desc' });
        orderBy.push({ createdAt: 'desc' });
      }

      movies = (await prisma.movieReview.findMany({
        where,
        orderBy,
        take: pageSize,
        skip,
      })) as unknown as MovieItem[];
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    movies = [];
    totalCount = 0;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to construct pagination URLs while preserving all active filters
  const buildPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (selectedGenre) p.set('genre', selectedGenre);
    if (selectedLanguage) p.set('language', selectedLanguage);
    if (sortBy && sortBy !== 'latest') p.set('sort', sortBy);
    if (pageNumber > 1) p.set('page', pageNumber.toString());
    const str = p.toString();
    return str ? `/?${str}` : '/';
  };

  // Find the featured movie for the hero billboard
  const heroMovie =
    !q && !selectedGenre && !selectedLanguage && currentPage === 1
      ? movies.find((m) => m.featured) || movies[0] || null
      : null;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnimoView',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://animoview.com',
    description: 'Curated movie reviews and profound wisdom extracted from world cinema.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://animoview.com'}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#07080d] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-x-hidden">
      {/* Schema.org WebSite & Sitelinks Searchbox JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      
      {/* Floating Glowing Cinema Balls with Firecracker Click Bursts 💥 (Homepage Only) */}
      <InteractiveBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar initialSearch={q} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Top Google AdSense Placement */}
          <AdBanner slot="home-top" format="horizontal" />

          {/* Big Billboard Hero Banner */}
          {heroMovie && <HeroBanner movie={heroMovie} />}

          {/* Search result indicator */}
          {q && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                Found <span className="font-extrabold text-amber-600 dark:text-amber-500">{totalCount}</span> review
                {totalCount === 1 ? '' : 's'} matching &ldquo;{q}&rdquo;
              </p>
              <Link
                href="/"
                className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline"
              >
                Clear Search
              </Link>
            </div>
          )}

          {/* Quick Filter Bar (Genres, Languages, Sorting) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            
            {/* Genre Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <Link
                href={selectedLanguage || sortBy !== 'latest' ? `/?language=${selectedLanguage}&sort=${sortBy}` : '/'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  !selectedGenre
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                }`}
              >
                All Genres
              </Link>
              {['Sci-Fi', 'Drama', 'Psychological', 'Action', 'Biography'].map((g) => (
                <Link
                  key={g}
                  href={`/?genre=${encodeURIComponent(g)}${selectedLanguage ? `&language=${selectedLanguage}` : ''}${sortBy !== 'latest' ? `&sort=${sortBy}` : ''}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedGenre.toLowerCase() === g.toLowerCase()
                      ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 scale-102'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                  }`}
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Sort Toggles */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link
                href={`/?${selectedGenre ? `genre=${selectedGenre}&` : ''}${selectedLanguage ? `language=${selectedLanguage}&` : ''}sort=latest`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  sortBy === 'latest'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Featured
              </Link>
              <Link
                href={`/?${selectedGenre ? `genre=${selectedGenre}&` : ''}${selectedLanguage ? `language=${selectedLanguage}&` : ''}sort=rating`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  sortBy === 'rating'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Highest Rated
              </Link>
            </div>
          </div>

          {/* Empty State */}
          {movies.length === 0 && (
            <div className="py-20 text-center rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-8">
              <Sparkles className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                No movie reviews found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                {q
                  ? `No movies matched "${q}". Try searching for director (e.g. "Nolan"), genre ("Sci-Fi"), or theme ("space", "adversity").`
                  : 'No reviews have been published yet.'}
              </p>
              {q && (
                <Link
                  href="/"
                  className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400"
                >
                  Clear Search
                </Link>
              )}
            </div>
          )}

          {/* Vibrant Movie Review Posters Grid (Tall 2:3 Posters) */}
          {movies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {movies.map((movie, index) => (
                <div key={movie.id} className="contents">
                  <MovieCard movie={movie} />
                  {/* Native In-feed Ad after 3rd item */}
                  {index === 2 && (
                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-3">
                      <AdBanner slot="in-feed-grid" format="in-feed" label="Sponsored Content" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <p className="text-xs text-zinc-500">
                Showing Page <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentPage}</span> of{' '}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalPages}</span> ({totalCount} total reviews)
              </p>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Link
                  href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage > 1
                      ? 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/60 shadow-2xs'
                      : 'opacity-40 pointer-events-none text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <Link
                      key={pNum}
                      href={buildPageUrl(pNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                        pNum === currentPage
                          ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/25 scale-105'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                      }`}
                    >
                      {pNum}
                    </Link>
                  ))}
                </div>

                {/* Next Button */}
                <Link
                  href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage < totalPages
                      ? 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/60 shadow-2xs'
                      : 'opacity-40 pointer-events-none text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </div>
  );
}
