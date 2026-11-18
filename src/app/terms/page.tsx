import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Animoto',
  description: 'Terms of Service, Fair Use Disclaimer, and DMCA policy for Animoto.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
            Terms of Service &amp; Copyright Notice
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Last Updated: November 2026
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            Welcome to <strong>Animoto</strong>. By accessing or using this website (https://animoto.com), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the website.
          </p>

          {/* Section 107 Fair Use Declaration */}
          <section id="fair-use" className="scroll-mt-24 p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <span>⚖️</span> Copyright &amp; Fair Use Disclaimer
            </h2>
            <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-3">
              This website contains copyrighted material the use of which has not always been specifically authorized by the copyright owner. We are making such material available in our efforts to advance critical commentary, review, and educational understanding of cinematic arts and storytelling psychology.
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              We believe this constitutes a <strong>&quot;Fair Use&quot;</strong> of any such copyrighted material as provided for in <strong>Section 107 of the US Copyright Law (17 U.S. Code § 107)</strong>. In accordance with Title 17 U.S.C. Section 107, the material on this site is distributed without profit to those who have expressed a prior interest in receiving the included information for research, critique, and educational purposes.
            </p>
          </section>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Ownership of Original Intellectual Property</h2>
          <p>
            All original editorial text, critical analysis, curated life learnings, score ratings, layouts, and logos published on Animoto are the exclusive intellectual property of Animoto. You may not republish, sell, or commercially reproduce whole articles without prior written permission.
          </p>
          <p>
            All film titles, promotional posters, trailers, backdrop stills, character names, and studio trademarks referenced on this website remain the registered property of their respective copyright and trademark owners (production companies, distributors, and filmmakers).
          </p>

          {/* DMCA Takedown Procedure */}
          <section id="dmca" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              DMCA &amp; Content Takedown Policy
            </h2>
            <p>
              Animoto respects the intellectual property rights of others and adheres to the Digital Millennium Copyright Act (DMCA). If you are a copyright owner or an agent thereof and believe that any promotional imagery, still, or media used on this site infringes upon your copyright beyond the scope of fair use, please notify us immediately.
            </p>
            <p className="mt-2">
              To submit a notice, please email{' '}
              <a href="mailto:contact@animoto.com" className="text-amber-500 underline font-semibold">
                contact@animoto.com
              </a>{' '}
              with the subject line &quot;DMCA Takedown Request&quot; and include:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>A description of the copyrighted work claimed to have been infringed.</li>
              <li>The exact URL on Animoto where the material is located.</li>
              <li>Your contact information (name, organization, and email address).</li>
              <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
            </ul>
            <p className="mt-2 text-xs sm:text-sm">
              Upon receipt of a valid notice, we will investigate and promptly remove or disable access to the contested material within <strong>48 to 72 hours</strong>.
            </p>
          </section>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Editorial Disclaimer</h2>
          <p>
            The reviews, analyses, scores, and life learnings presented on Animoto represent the subjective perspectives of our editorial staff. They are intended for entertainment, inspiration, and critical discussion. We make no guarantees that your viewing experience or personal interpretation will mirror ours.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Limitation of Liability</h2>
          <p>
            In no event shall Animoto, its creators, or affiliates be liable for any indirect, incidental, or consequential damages arising out of your access to or use of this website. All services and content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Modifications to Terms</h2>
          <p>
            We reserve the right to revise these Terms of Service at any time. Continued use of the website following any changes constitutes acceptance of the modified terms.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Contact Information</h2>
          <p>
            If you have any questions regarding these Terms, please reach out to us at{' '}
            <a href="mailto:contact@animoto.com" className="text-amber-500 underline font-semibold">
              contact@animoto.com
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
