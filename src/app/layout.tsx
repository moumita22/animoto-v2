import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://animoto.com'),
  title: {
    default: 'Animoto | Curated Movie Reviews & Learnings',
    template: '%s | Animoto',
  },
  description:
    'Discover curated movie reviews, critical ratings, and profound learnings on resilience, psychology, and personal growth from world cinema.',
  keywords: [
    'movie reviews',
    'learnings from movies',
    'movie philosophy',
    'animoto reviews',
    'inspirational movies',
    'film analysis',
  ],
  authors: [{ name: 'Animoto Editorial' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
