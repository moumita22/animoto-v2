import Link from 'next/link';
import { Star, Sparkles, ArrowRight, Play, Globe } from 'lucide-react';
import { MovieItem } from './MovieCard';

export default function HeroBanner({ movie }: { movie: MovieItem | null }) {
  if (!movie) return null;

  return (
    <section className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 group">
      
      {/* 100% Visible, Crisp, High-Res Cinematic Image */}
      <div className="relative w-full aspect-[21/9] min-h-[380px] sm:min-h-[460px] overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={`Review and Learning from ${movie.title}`}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
        />

        {/* Minimal bottom gradient only behind text for clean readability without hiding the image */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
            Featured Film
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
            <Globe className="w-3 h-3 text-amber-400" />
            {movie.language}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-zinc-200 border border-zinc-700/60">
            {movie.year}
          </span>
        </div>

        {/* Content Sitting Cleanly on Lower Gradient */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 z-10 flex flex-col justify-end text-white">
          
          <div className="max-w-3xl">
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2 drop-shadow-md">
              {movie.title}
            </h1>

            {/* Score, Director & Genre */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-200 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs shadow-md">
                <Star className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
                <span>{movie.rating.toFixed(1)} / 10 Score</span>
              </div>
              <span className="font-semibold text-zinc-200">Dir. {movie.director}</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-300">{movie.genre}</span>
            </div>

            {/* Synopsis line */}
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed mb-4 drop-shadow">
              {movie.synopsis}
            </p>

            {/* Action button */}
            <Link
              href={`/reviews/${movie.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Read Full Review &amp; Learnings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
}
