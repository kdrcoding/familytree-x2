import { Link } from 'react-router-dom';
import {
  Heart,
  KeyRound,
  Pencil,
  Search,
  ShieldCheck,
  TreePine,
  UserRoundPlus,
} from 'lucide-react';
import { useT } from '../i18n/useT';

export function AboutPage() {
  const t = useT();

  const steps = [
    {
      icon: Search,
      title: t('about.howStep1Title'),
      text: t('about.howStep1Text'),
    },
    {
      icon: Pencil,
      title: t('about.howStep2Title'),
      text: t('about.howStep2Text'),
    },
    {
      icon: Heart,
      title: t('about.howStep3Title'),
      text: t('about.howStep3Text'),
    },
    {
      icon: UserRoundPlus,
      title: t('about.howStep4Title'),
      text: t('about.howStep4Text'),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
        {t('about.title')}
      </h1>

      <section className="card mt-6 overflow-hidden p-6 shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.2)]">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100">{t('about.howTitle')}</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('about.howIntro')}</p>
        <ol className="mt-5 space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                    {t('about.howStep', { n: i + 1 })}
                  </p>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/tree" className="btn-primary">
            <TreePine className="h-4 w-4" aria-hidden /> {t('about.howOpenTree')}
          </Link>
          <Link to="/members" className="btn-secondary">
            {t('nav.members')}
          </Link>
        </div>
      </section>

      <section className="card mt-4 overflow-hidden p-6 shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.2)]">
        <h2 className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
          <TreePine className="h-5 w-5 text-brand-600" aria-hidden /> {t('about.purposeTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {t('about.purposeText')}
        </p>
      </section>

      <section className="card mt-4 overflow-hidden p-6 shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.2)]">
        <h2 className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
          <KeyRound className="h-5 w-5 text-brand-600" aria-hidden /> {t('about.contributeTitle')}
        </h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          <p>{t('about.contributeText1')}</p>
          <p>{t('about.contributeText2')}</p>
        </div>
      </section>

      <section className="card mt-4 overflow-hidden p-6 shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.2)]">
        <h2 className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
          <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden /> {t('about.privacyTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {t('about.privacyText')}
        </p>
      </section>
    </div>
  );
}
