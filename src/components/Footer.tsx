'use client';

import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#06070a] text-zinc-600 dark:text-zinc-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center">
                <Film className="w-4 h-4 text-zinc-950" />
              </div>
              <span className="font-extrabold text-lg text-zinc-900 dark:text-white">
                AnimoView
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Curated movie reviews and profound learnings. Extracting psychology, resilience, and wisdom from world cinema to enrich your mindset.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-500 transition-colors">
                  All Reviews
                </Link>
              </li>
              <li>
                <Link href="/?sort=rating" className="hover:text-amber-500 transition-colors">
                  Top Rated Movies
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-500 transition-colors">
                  About &amp; Methodology
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Mandatory AdSense Trust Pages */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 gap-4">
          <p>© 2026 AnimoView. All rights reserved.</p>
          <p className="text-center sm:text-right text-[11px] max-w-xl text-zinc-500 dark:text-zinc-400">
            Movie titles, posters, stills, and trademarks are property of their respective copyright holders, used under{' '}
            <Link href="/terms#fair-use" className="text-amber-500 underline hover:text-amber-400 font-medium">
              Fair Use (17 U.S.C. § 107) &amp; Fair Dealing (Sec. 52, Indian Copyright Act 1957)
            </Link>{' '}
            for critical commentary, review, and educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
