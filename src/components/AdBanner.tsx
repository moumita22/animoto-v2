export default function AdBanner({
  slot = 'top-banner',
  format = 'horizontal',
  label = 'Advertisement'
}: {
  slot?: string;
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  label?: string;
}) {
  const isHorizontal = format === 'horizontal';
  const isInFeed = format === 'in-feed';

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${isInFeed ? 'my-8' : ''}`}>
      <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-1">
        {label}
      </span>
      <div
        data-ad-slot={slot}
        className={`w-full flex items-center justify-center rounded-xl border border-dashed 
                   border-zinc-300 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600
                   transition-all duration-200 overflow-hidden
                   ${isHorizontal ? 'min-h-[90px] max-w-4xl' : ''}
                   ${isInFeed ? 'min-h-[120px] max-w-2xl' : ''}
                   ${format === 'rectangle' ? 'min-h-[250px] max-w-xs' : ''}
                  `}
      >
        <div className="text-center px-4 py-3">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Google AdSense Placement
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {format === 'horizontal' && 'Leaderboard (728x90 / Responsive)'}
            {format === 'in-feed' && 'Native In-Feed Responsive Unit'}
            {format === 'rectangle' && 'Display Rectangle (300x250)'}
          </p>
        </div>
      </div>
    </div>
  );
}
