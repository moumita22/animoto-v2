'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('theme');
  return stored !== 'light';
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('storage'));
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-200/60 dark:bg-zinc-800/50 border border-zinc-300/60 dark:border-zinc-700/50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full transition-all duration-200 
                 bg-white hover:bg-zinc-100 text-zinc-800
                 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-amber-400
                 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:scale-105 active:scale-95"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
    </button>
  );
}
