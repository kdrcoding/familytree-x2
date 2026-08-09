import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarPlus,
  Globe,
  Heart,
  TreePine,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import { JoinFamilyModal } from '../components/JoinFamilyModal';
import { PersonSearch } from '../components/PersonSearch';
import { BrandMark } from '../components/BrandLogo';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useLanguage, useT } from '../i18n/useT';
import { computeStats } from '../utils/stats';
import { findFounders, fullName } from '../utils/family';
import { formatDate, monthAbbr } from '../utils/dates';
import { countryLabel } from '../utils/countries';
import { getUpcomingBirthdays } from '../utils/birthdays';
import { getUpcomingAnniversaries } from '../utils/anniversaries';
import { downloadFamilyCalendarIcs } from '../utils/ics';
import { loadJson, saveJson, STORAGE_KEYS } from '../utils/storage';
import { usePrivacy } from '../hooks/usePrivacy';
import { Avatar } from '../components/Avatar';

/** How far ahead the homepage looks for upcoming birthdays. */
const BIRTHDAY_WINDOW_DAYS = 30;

export function HomePage() {
  const { people } = useFamily();
  const { settings } = useSettings();
  const privacy = usePrivacy();
  const { toast } = useToast();
  const t = useT();
  const language = useLanguage();
  const [joinOpen, setJoinOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const easy = role !== 'owner' && Boolean(settings.easyMode);
  const stats = useMemo(() => computeStats(people), [people]);
  const founders = useMemo(() => findFounders(people).slice(0, 2), [people]);

  const showBirthDates = privacy.showBirthDate();
  const upcoming = useMemo(
    () => (showBirthDates ? getUpcomingBirthdays(people) : []),
    [people, showBirthDates],
  );
  // Only list birthdays inside the window — empty state when none are near.
  const birthdays = useMemo(
    () => upcoming.filter((b) => b.daysUntil <= BIRTHDAY_WINDOW_DAYS),
    [upcoming],
  );

  const upcomingAnniversaries = useMemo(() => getUpcomingAnniversaries(people), [people]);
  const anniversaries = useMemo(() => {
    const soon = upcomingAnniversaries.filter((a) => a.daysUntil <= BIRTHDAY_WINDOW_DAYS);
    return soon.length > 0 ? soon : upcomingAnniversaries.slice(0, 2);
  }, [upcomingAnniversaries]);

  useEffect(() => {
    const todays = upcoming.filter((b) => b.isToday);
    if (todays.length === 0) return;
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const last = loadJson<string>(
      STORAGE_KEYS.birthdayNotified,
      (v): v is string => typeof v === 'string',
    );
    if (last === todayKey) return;
    saveJson(STORAGE_KEYS.birthdayNotified, todayKey);
    toast(
      todays.length === 1
        ? t('home.bdayToastOne', { name: fullName(todays[0].person) })
        : t('home.bdayToastMany', { names: todays.map((b) => fullName(b.person)).join(', ') }),
      'info',
    );
  }, [upcoming, toast, t]);

  useEffect(() => {
    if (searchParams.get('invite') === '1' || searchParams.get('join') === '1') {
      setJoinOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('invite');
      next.delete('join');
      setSearchParams(next, { replace: true });
      toast(t('invite.openedToast'), 'info');
    }
  }, [searchParams, setSearchParams, toast, t]);

  const whenLabel = (isToday: boolean, daysUntil: number) =>
    isToday
      ? t('home.bdayToday')
      : daysUntil === 1
        ? t('home.bdayTomorrow')
        : t('home.bdayInDays', { n: daysUntil });

  const downloadCalendar = () => {
    downloadFamilyCalendarIcs(people, {
      language,
      calendarName: t('site.title'),
    });
    toast(t('home.calendarDownloaded'), 'info');
  };

  return (
    <div className="home-page">
      <section className="home-hero overflow-hidden text-brand-950 dark:text-stone-50" aria-labelledby="home-brand">
        <div className="home-hero__atmosphere" aria-hidden>
          <svg className="home-hero__pedigree" viewBox="0 0 420 420" fill="none">
            <path
              d="M210 48v72M210 120L96 210M210 120l114 90M96 210v78M324 210v78M96 288L48 360M96 288l48 72M324 288l-48 72M324 288l48 72"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <circle cx="210" cy="42" r="14" fill="currentColor" opacity="0.55" />
            <circle cx="96" cy="210" r="11" fill="currentColor" opacity="0.4" />
            <circle cx="324" cy="210" r="11" fill="currentColor" opacity="0.4" />
            <circle cx="48" cy="360" r="9" fill="currentColor" opacity="0.28" />
            <circle cx="144" cy="360" r="9" fill="currentColor" opacity="0.28" />
            <circle cx="276" cy="360" r="9" fill="currentColor" opacity="0.28" />
            <circle cx="372" cy="360" r="9" fill="currentColor" opacity="0.28" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12">
          <div className="home-hero__mark">
            <BrandMark
              size="lg"
              title={t('site.title')}
              className="!h-14 !w-14 !rounded-xl shadow-lg ring-1 ring-brand-900/10 sm:!h-[4.5rem] sm:!w-[4.5rem] sm:!rounded-[1.25rem] dark:ring-white/10"
            />
          </div>

          <p className="home-hero__kicker mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-700/80 dark:text-brand-200/80 sm:mt-6 sm:text-xs">
            {t('home.kicker')}
          </p>

          <h1
            id="home-brand"
            className="home-hero__title mt-2 font-display text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-brand-950 dark:text-white sm:mt-3 sm:text-5xl"
          >
            {t('site.title')}
          </h1>

          <p className="home-hero__intro mt-3 max-w-xl text-base leading-relaxed text-brand-900/80 dark:text-stone-200/90 sm:mt-4 sm:text-lg">
            {easy ? t('home.introEasy') : t('home.intro')}
          </p>

          <div className="home-hero__search relative z-20 mt-6 max-w-lg sm:mt-8">
            <p className="mb-2 text-sm font-medium text-brand-800/80 dark:text-brand-100/80">
              {t('home.searchTitle')}
            </p>
            <PersonSearch large placeholder={t('home.searchPlaceholder')} />
          </div>

          <div className="home-hero__actions mt-4 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center">
            <Link
              to="/tree"
              className="hidden min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-950/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-100 active:translate-y-0 sm:inline-flex dark:bg-white dark:text-brand-950 dark:shadow-brand-950/20 dark:hover:bg-brand-50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-brand-950"
            >
              {t('home.explore')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white/70 px-6 py-3 text-base font-semibold text-brand-900 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-100 active:translate-y-0 dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-brand-950"
            >
              <UserRoundPlus className="h-4 w-4" aria-hidden />
              {t('home.addSelf')}
            </button>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-6 w-full max-w-3xl space-y-7 px-5 sm:space-y-8 sm:px-8">
        {/* Birthdays */}
        {showBirthDates && (
          <section className="home-section" aria-labelledby="home-birthdays">
            <div className="home-section-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-5 py-4 dark:border-stone-700/80">
                <h2
                  id="home-birthdays"
                  className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-xl"
                >
                  {t('home.birthdaysTitle')}
                </h2>
                {!easy && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
                    onClick={downloadCalendar}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                    {t('home.downloadCalendar')}
                  </button>
                )}
              </div>

              {birthdays.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {t('home.bdayEmpty', { days: BIRTHDAY_WINDOW_DAYS })}
                  </p>
                  {!easy && (
                    <button
                      type="button"
                      className="btn-secondary mt-4 !text-xs"
                      onClick={downloadCalendar}
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                      {t('home.downloadCalendar')}
                    </button>
                  )}
                </div>
              ) : (
                <ul className="space-y-2 p-3 sm:p-4">
                  {birthdays.map((b) => {
                    const showAge = b.turningAge !== null && privacy.showAge(b.person);
                    return (
                      <li key={b.person.id}>
                        <Link
                          to={`/tree?person=${encodeURIComponent(b.person.id)}`}
                          className={`home-bday-row ${b.isToday ? 'home-bday-today' : ''}`}
                        >
                          <span className="home-bday-date" aria-hidden>
                            <span className="home-bday-date__month">
                              {monthAbbr(b.month, language)}
                            </span>
                            <span className="home-bday-date__day">{b.day}</span>
                          </span>
                          <Avatar person={b.person} size={b.isToday ? 'md' : 'sm'} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                              {fullName(b.person)}
                            </p>
                            {showAge ? (
                              <p className="text-sm text-stone-500 dark:text-stone-400">
                                {b.isToday
                                  ? t('home.bdayTurnsToday', { age: b.turningAge! })
                                  : t('home.bdayTurns', { age: b.turningAge! })}
                              </p>
                            ) : null}
                          </div>
                          <span
                            className={`home-bday-when ${b.isToday ? 'home-bday-when--today' : ''}`}
                          >
                            {whenLabel(b.isToday, b.daysUntil)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        )}

        {!easy && (
          <section
            aria-label={t('home.summaryLabel')}
            className="home-section hidden grid-cols-2 gap-2.5 sm:grid sm:grid-cols-4 sm:gap-3"
          >
            {[
              { icon: Users, label: t('home.statMembers'), value: stats.total },
              { icon: TreePine, label: t('home.statGenerations'), value: stats.generations },
              { icon: Heart, label: t('home.statLiving'), value: stats.living },
              { icon: Globe, label: t('home.statCountries'), value: stats.countries.length },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="home-stat-card">
                  <Icon className="h-4 w-4 text-brand-700/70 dark:text-brand-400/70" aria-hidden />
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </section>
        )}

        {!easy && anniversaries.length > 0 && (
          <section className="home-section hidden sm:block" aria-labelledby="home-anniv">
            <div className="home-section-card overflow-hidden">
              <h2
                id="home-anniv"
                className="border-b border-stone-200/80 px-5 py-4 font-display text-lg font-semibold tracking-tight text-stone-900 dark:border-stone-700/80 dark:text-stone-50 sm:text-xl"
              >
                {t('home.annivTitle')}
              </h2>
              <ul className="divide-y divide-stone-100 px-2 py-2 sm:px-3 dark:divide-stone-800">
                {anniversaries.map((a) => (
                  <li key={`${a.a.id}-${a.b.id}`} className="home-list-item !cursor-default">
                    <div className="flex -space-x-2">
                      <Avatar person={a.a} size="md" />
                      <Avatar person={a.b} size="md" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                        {fullName(a.a)} & {fullName(a.b)}
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {monthAbbr(a.month, language)} {a.day}
                        {a.years !== null && (
                          <>
                            {' · '}
                            {a.years === 1
                              ? a.isToday
                                ? t('home.annivYearOneToday')
                                : t('home.annivYearOne')
                              : a.isToday
                                ? t('home.annivYearsToday', { n: a.years })
                                : t('home.annivYears', { n: a.years })}
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                        a.isToday
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {whenLabel(a.isToday, a.daysUntil)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {!easy && founders.length > 0 && (
          <section className="home-section hidden sm:block" aria-labelledby="home-founders">
            <div className="home-section-card overflow-hidden">
              <h2
                id="home-founders"
                className="border-b border-stone-200/80 px-5 py-4 font-display text-lg font-semibold tracking-tight text-stone-900 dark:border-stone-700/80 dark:text-stone-50 sm:text-xl"
              >
                {t('home.foundersTitle')}
              </h2>
              <ul className="divide-y divide-stone-100 px-2 py-2 sm:px-3 dark:divide-stone-800">
                {founders.map((person) => (
                  <li key={person.id}>
                    <Link
                      to={`/tree?person=${encodeURIComponent(person.id)}`}
                      className="home-list-item group !gap-4"
                    >
                      <Avatar person={person} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          {fullName(person)}
                        </p>
                        {privacy.showBirthDate() && person.birthDate && (
                          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                            {t('home.born', { date: formatDate(person.birthDate, language) })}
                            {person.country
                              ? ` · ${privacy.showCity() && person.city ? person.city + ', ' : ''}${countryLabel(person.country, language)}`
                              : ''}
                          </p>
                        )}
                        {privacy.showOccupation() && person.occupation && (
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            {person.occupation}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 dark:text-stone-600"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {!easy && (
          <p className="home-section hidden rounded-xl border border-stone-200/60 bg-stone-50/70 px-5 py-4 text-sm leading-relaxed text-stone-500 sm:block dark:border-stone-700/60 dark:bg-stone-900/50 dark:text-stone-400">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {t('home.privacyStrong')}
            </span>{' '}
            {t('home.privacyBefore')}
            <Link
              to="/settings"
              className="font-medium text-brand-800 underline-offset-2 hover:underline dark:text-brand-400"
            >
              {t('home.settingsLink')}
            </Link>
            {t('home.privacyAfter')}
          </p>
        )}
      </div>

      {joinOpen && <JoinFamilyModal onClose={() => setJoinOpen(false)} />}
    </div>
  );
}
