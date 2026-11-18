import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Animoto',
  description: 'Privacy Policy and Google AdSense cookie compliance for Animoto.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Last Updated: November 2026
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#12141e] border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>
            At <strong>Animoto</strong>, accessible from https://animoto.com, the privacy of our visitors is one of our main priorities. This Privacy Policy document outlines the types of information that is collected and recorded by Animoto and how we use it.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Google AdSense &amp; Third-Party Advertising</h2>
          <p>
            Google is a third-party vendor on our site. It uses cookies, commonly known as advertising and DART cookies, to serve ads to our site visitors based upon their visit to Animoto and other sites on the internet.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to our visitors based on their visit to our sites and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold hover:text-amber-400"
              >
                Google Ads Settings
              </a>.
            </li>
            <li>
              Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold hover:text-amber-400"
              >
                www.aboutads.info/choices
              </a>{' '}
              or the Network Advertising Initiative at{' '}
              <a
                href="https://optout.networkadvertising.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline font-semibold hover:text-amber-400"
              >
                optout.networkadvertising.org
              </a>.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cookies &amp; How to Manage Them</h2>
          <p>
            Animoto uses cookies to store information about visitors&apos; preferences, user-specific information on which pages the visitor accesses or visits, and to customize web page content based on visitors&apos; browser type or other information.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Google Chrome: Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
            <li>Mozilla Firefox: Options &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection</li>
            <li>Apple Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
            <li>Microsoft Edge: Settings &gt; Cookies and site permissions</li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Log Files &amp; Web Analytics</h2>
          <p>
            Animoto follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">GDPR &amp; CCPA Data Protection Rights</h2>
          <p>
            We would like to make sure you are fully aware of all of your data protection rights under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
            <li><strong>The right to opt-out:</strong> California consumers have the right to request that a business not sell their personal information. Animoto does not sell personal information.</li>
          </ul>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Children&apos;s Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Animoto does not knowingly collect any Personal Identifiable Information from children under the age of 13.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Contact Us</h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at{' '}
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
