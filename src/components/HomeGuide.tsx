import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useT } from '../i18n/useT';

interface HomeGuideProps {
  onAddSelf: () => void;
}

/** Illustrated how-to steps — CSS/SVG mock panels, not live screenshots. */
export function HomeGuide({ onAddSelf }: HomeGuideProps) {
  const t = useT();

  const steps: {
    id: string;
    title: string;
    text: string;
    mock: ReactNode;
    action?: ReactNode;
  }[] = [
    {
      id: 'tree',
      title: t('home.guideStep1Title'),
      text: t('home.guideStep1Text'),
      mock: <MockTree />,
      action: (
        <Link to="/tree" className="home-guide-action">
          {t('home.guideOpenTree')}
        </Link>
      ),
    },
    {
      id: 'search',
      title: t('home.guideStep2Title'),
      text: t('home.guideStep2Text'),
      mock: <MockSearch />,
    },
    {
      id: 'edit',
      title: t('home.guideStep3Title'),
      text: t('home.guideStep3Text'),
      mock: <MockEdit />,
    },
    {
      id: 'join',
      title: t('home.guideStep4Title'),
      text: t('home.guideStep4Text'),
      mock: <MockJoin />,
      action: (
        <button type="button" className="home-guide-action" onClick={onAddSelf}>
          {t('home.guideAddSelf')}
        </button>
      ),
    },
  ];

  return (
    <section className="home-section" aria-labelledby="home-guide">
      <div className="home-section-card overflow-hidden">
        <div className="border-b border-stone-200/80 px-5 py-4 dark:border-stone-700/80">
          <h2
            id="home-guide"
            className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-xl"
          >
            {t('home.guideTitle')}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('home.guideIntro')}</p>
        </div>

        <ol className="grid gap-0 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className={`flex flex-col gap-3 border-stone-100 p-4 sm:p-5 dark:border-stone-800 ${
                i % 2 === 0 ? 'sm:border-r' : ''
              } ${i < 2 ? 'border-b' : i === 2 ? 'border-b sm:border-b-0' : ''}`}
            >
              <div className="home-guide-mock" aria-hidden>
                {step.mock}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-700/80 dark:text-brand-400/80">
                  {t('home.guideStep', { n: i + 1 })}
                </p>
                <h3 className="mt-1 font-semibold text-stone-900 dark:text-stone-100">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {step.text}
                </p>
                {step.action ? <div className="mt-3">{step.action}</div> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MockTree() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" fill="none">
      <path
        d="M100 28v18M70 60H130M70 60v14M130 60v14"
        stroke="currentColor"
        className="text-stone-300 dark:text-stone-600"
        strokeWidth="1.5"
      />
      <rect x="72" y="8" width="56" height="22" rx="6" fill="var(--color-brand-100)" stroke="var(--color-brand-300)" strokeWidth="1.25" className="dark:fill-brand-950 dark:stroke-brand-700" />
      <rect x="28" y="74" width="50" height="22" rx="6" fill="var(--color-stone-100)" stroke="var(--color-stone-300)" strokeWidth="1.25" className="dark:fill-stone-800 dark:stroke-stone-600" />
      <rect x="122" y="74" width="50" height="22" rx="6" fill="var(--color-stone-100)" stroke="var(--color-stone-300)" strokeWidth="1.25" className="dark:fill-stone-800 dark:stroke-stone-600" />
      <circle cx="86" cy="19" r="5" fill="var(--color-brand-400)" opacity="0.7" />
      <circle cx="42" cy="85" r="4.5" fill="var(--color-stone-400)" opacity="0.5" />
      <circle cx="136" cy="85" r="4.5" fill="var(--color-stone-400)" opacity="0.5" />
    </svg>
  );
}

function MockSearch() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" fill="none">
      <rect x="24" y="38" width="152" height="34" rx="10" fill="var(--color-white, #fff)" stroke="var(--color-stone-300)" strokeWidth="1.25" className="dark:fill-stone-800 dark:stroke-stone-600" />
      <circle cx="44" cy="55" r="7" stroke="var(--color-stone-400)" strokeWidth="1.5" className="dark:stroke-stone-500" />
      <path d="M49 60l6 6" stroke="var(--color-stone-400)" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-stone-500" />
      <rect x="58" y="50" width="72" height="8" rx="3" fill="var(--color-stone-200)" className="dark:fill-stone-600" />
      <rect x="36" y="80" width="90" height="8" rx="3" fill="var(--color-brand-100)" className="dark:fill-brand-900" />
      <rect x="36" y="92" width="60" height="6" rx="2" fill="var(--color-stone-100)" className="dark:fill-stone-700" />
    </svg>
  );
}

function MockEdit() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" fill="none">
      <rect x="40" y="28" width="100" height="54" rx="10" fill="var(--color-stone-50)" stroke="var(--color-stone-300)" strokeWidth="1.25" className="dark:fill-stone-800 dark:stroke-stone-600" />
      <circle cx="62" cy="55" r="12" fill="var(--color-brand-100)" className="dark:fill-brand-900" />
      <rect x="82" y="46" width="44" height="7" rx="2" fill="var(--color-stone-300)" className="dark:fill-stone-500" />
      <rect x="82" y="58" width="28" height="5" rx="2" fill="var(--color-stone-200)" className="dark:fill-stone-600" />
      <circle cx="148" cy="40" r="12" fill="var(--color-brand-600)" className="dark:fill-brand-500" />
      <path d="M148 34v12M142 40h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M128 72l8-8 4 4-8 8h-4v-4z" fill="var(--color-brand-700)" className="dark:fill-brand-400" />
    </svg>
  );
}

function MockJoin() {
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" fill="none">
      <rect x="48" y="18" width="104" height="74" rx="10" fill="var(--color-white, #fff)" stroke="var(--color-stone-300)" strokeWidth="1.25" className="dark:fill-stone-800 dark:stroke-stone-600" />
      <circle cx="100" cy="40" r="12" fill="var(--color-brand-100)" className="dark:fill-brand-900" />
      <rect x="68" y="58" width="64" height="7" rx="2" fill="var(--color-stone-200)" className="dark:fill-stone-600" />
      <rect x="78" y="70" width="44" height="7" rx="2" fill="var(--color-stone-100)" className="dark:fill-stone-700" />
      <rect x="72" y="82" width="56" height="14" rx="6" fill="var(--color-brand-600)" className="dark:fill-brand-500" />
    </svg>
  );
}
