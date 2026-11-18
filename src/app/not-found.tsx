import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InteractiveBackground from '@/components/InteractiveBackground';
import { Film, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-x-hidden">
      <InteractiveBackground />
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        <div className="max-w-md w-full text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-6">
            <Film className="w-8 h-8" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-3">
            404
          </h1>
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            Review or Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            This review might be unpublished, still in draft mode, or the URL might have moved.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md hover:scale-105 transition-all"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
