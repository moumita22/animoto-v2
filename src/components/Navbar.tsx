'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ initialSearch = '' }: { initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-[#090a0f]/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                AnimoView
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Reviews &amp; Learnings
                </span>
              </span>
            </div>
          </Link>

          {/* Search bar with PostgreSQL GIN full-text support */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, directors, genres, languages..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-2xs"
              />
            </div>
          </form>

          {/* Right actions: ThemeToggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by movie, director, genre, language..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-100/90 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>
          </form>
        </div>

      </div>
    </header>
  );
}
