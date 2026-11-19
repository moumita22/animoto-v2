import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Film, Target, Award, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About AnimoView | Movie Reviews & Learnings',
  description: 'Our mission and review methodology at AnimoView.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
            <Film className="w-3.5 h-3.5" />
            Our Mission &amp; Editorial Standards
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            About AnimoView
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-3">
            More than just entertainment — extracting psychological insights, resilience, and philosophical wisdom from cinema.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Why We Review Movies Through Learnings
            </h2>
            <p>
              Cinema is one of humanity&apos;s greatest storytelling mediums. While many review platforms focus purely on box office numbers or technical effects, <strong>AnimoView</strong> exists to answer a deeper question: <em>What can this film teach us about real life, adversity, ambition, and relationships?</em>
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Our Review &amp; Scoring Methodology
            </h2>
            <p className="mb-4">
              Every score on AnimoView (ranging from 1.0 to 10.0) is personally evaluated based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Narrative &amp; Emotional Depth:</strong> How genuinely the story connects and impacts the human experience.</li>
              <li><strong>Mindset &amp; Philosophical Takeaways:</strong> The applicability of the film&apos;s core lessons to everyday challenges.</li>
              <li><strong>Directing &amp; Performance:</strong> The creative conviction brought by the director and cast.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Independent &amp; Free
            </h2>
            <p>
              AnimoView is completely free for all readers. We sustain our operations through respectful advertising via Google AdSense. We do not accept sponsored positive reviews.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
