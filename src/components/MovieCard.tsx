import Link from 'next/link';
import { Star, Sparkles, ArrowRight, Globe } from 'lucide-react';

export interface MovieItem {
  id: number;
  title: string;
  slug: string;
  year: number;
  genre: string;
  language: string;
  director: string;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  synopsis: string;
  lifeLessons: string;
  featured: boolean;
}

export default function MovieCard({ movie }: { movie: MovieItem }) {
  // Parse lessons safely
  let lessons: string[] = [];
  try {
    lessons = JSON.parse(movie.lifeLessons);
  } catch {
    lessons = movie.lifeLessons ? [movie.lifeLessons] : [];
  }

  const primaryLesson = lessons.length > 0 ? lessons[0] : null;

  return (
    <article className="group relative flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-[#10121d] border border-zinc-200/80 dark:border-zinc-800/90 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
      
      {/* Big Vertical Cinema Poster (Tall 2:3 Aspect Ratio) */}
      <Link
        href={`/reviews/${movie.slug}`}
        className="relative aspect-[2/3] w-full overflow-hidden block bg-zinc-950"
      >
        <img
          src={movie.posterUrl || movie.backdropUrl}
          alt={`Review and Learning from ${movie.title}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Dramatic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-transparent" />

        {/* Top Badges: Score & Language */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
            <Globe className="w-3 h-3 text-amber-400" />
            {movie.language}
          </span>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md border border-amber-500/50 text-amber-400 font-black text-xs shadow-xl shadow-black/40">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom Poster Info (Year, Genre Pill) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
          <span className="px-2.5 py-0.5 rounded-md font-bold bg-zinc-900/90 backdrop-blur-md text-white border border-zinc-700/60 shadow">
            {movie.year}
          </span>
          <span className="text-[11px] font-semibold text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md truncate max-w-[150px]">
            {movie.genre.split(',')[0]}
          </span>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Director line */}
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">
            Dir. {movie.director}
          </p>

          {/* Title */}
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
            <Link href={`/reviews/${movie.slug}`}>
              {movie.title}
            </Link>
          </h3>

          {/* Synopsis */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {movie.synopsis}
          </p>

          {/* Punchy Key Takeaway Badge */}
          {primaryLesson && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/25 text-zinc-800 dark:text-zinc-200 text-xs mb-4">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold mb-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Big Takeaway:</span>
              </div>
              <p className="line-clamp-2 italic text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                &ldquo;{primaryLesson}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Card Footer Button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end">
          <Link
            href={`/reviews/${movie.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 group-hover:translate-x-1 transition-all"
          >
            <span>Read Review &amp; Learnings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </article>
  );
}
