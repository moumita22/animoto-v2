import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Animoto',
  description: 'Get in touch with the Animoto editorial team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mb-3">
          Contact Us
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Have a movie recommendation, feedback, or inquiry? We would love to hear from you.
        </p>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <Mail className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-zinc-400">Direct Email</p>
              <a href="mailto:contact@animoto.com" className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-amber-500">
                contact@animoto.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-zinc-400">Editorial &amp; Review Suggestions</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                If you have a movie that changed your mindset and would like us to review it and extract its learnings, send us the movie title and your favorite scene!
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
