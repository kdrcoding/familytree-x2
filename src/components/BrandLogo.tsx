import type { ReactNode } from 'react';
import { useId } from 'react';
import { useT } from '../i18n/useT';

type MarkSize = 'sm' | 'md' | 'lg';

const SIZES: Record<MarkSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-16 w-16',
};

/**
 * Shajira mark: layered family tree with a soft gold root glow —
 * distinct from the Oq-Ariq emerald pedigree mark.
 */
export function BrandMark({
  size = 'md',
  className = '',
  title,
}: {
  size?: MarkSize;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const bgId = `sj-bg-${uid}`;
  const inkId = `sj-ink-${uid}`;
  const glowId = `sj-glow-${uid}`;

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-brand-900/15 dark:ring-white/10 ${SIZES[size]} ${className}`}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label={title}>
        <defs>
          <linearGradient id={bgId} x1="8" y1="2" x2="56" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0c4a6e" />
            <stop offset="0.55" stopColor="#075985" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id={inkId} x1="20" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0f9ff" />
            <stop offset="1" stopColor="#bae6fd" />
          </linearGradient>
          <radialGradient id={glowId} cx="32" cy="48" r="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f5d78e" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f5d78e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
        <circle cx="32" cy="48" r="18" fill={`url(#${glowId})`} />
        <path
          d="M32 14v16M32 30L16 42M32 30l16 12M16 42v10M48 42v10M16 52L8 58M16 52l8 6M48 52l-8 6M48 52l8 6"
          fill="none"
          stroke={`url(#${inkId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="12" r="5" fill="#f8fafc" />
        <circle cx="16" cy="42" r="4.25" fill="#e0f2fe" />
        <circle cx="48" cy="42" r="4.25" fill="#e0f2fe" />
        <circle cx="8" cy="58" r="3.25" fill="#bae6fd" />
        <circle cx="24" cy="58" r="3.25" fill="#bae6fd" />
        <circle cx="40" cy="58" r="3.25" fill="#bae6fd" />
        <circle cx="56" cy="58" r="3.25" fill="#bae6fd" />
        <circle cx="32" cy="30" r="2.75" fill="#f5d78e" />
      </svg>
    </span>
  );
}

/** Header / lock-screen lockup: mark + optional wordmark. */
export function BrandLogo({
  size = 'md',
  wordmark = true,
  className = '',
}: {
  size?: MarkSize;
  wordmark?: boolean;
  className?: string;
}) {
  const t = useT();
  const title = t('site.title');

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <BrandMark size={size} title={title} />
      {wordmark && (
        <span className="min-w-0 truncate font-display text-base font-semibold tracking-tight text-stone-900 sm:text-lg dark:text-stone-50">
          {title}
        </span>
      )}
    </span>
  );
}

/** Large lock-screen / empty-state hero mark with caption slot. */
export function BrandHero({ children }: { children?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center text-center">
      <BrandMark size="lg" title={t('site.title')} className="!h-20 !w-20 !rounded-[1.35rem] shadow-md" />
      {children}
    </div>
  );
}
