import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, Languages, Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { languageCodeLabel, nextLanguage } from '../types/family';
import { useT } from '../i18n/useT';
import { MadeByKadir } from './MadeByKadir';
import { BottomNav } from './BottomNav';
import { PageSkeleton } from './PageSkeleton';
import { BrandLogo } from './BrandLogo';

export function Layout() {
  const { settings, toggleTheme, setLanguage } = useSettings();
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const t = useT();
  const isTreePage = location.pathname === '/tree';
  const easy = role !== 'owner' && Boolean(settings.easyMode);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const cycleLanguage = () => setLanguage(nextLanguage(settings.language));

  // Compact primary: Home / Tree / Members — Settings is the gear icon.
  const primaryNav = [
    { to: '/', label: t('nav.home') },
    { to: '/tree', label: t('nav.tree') },
    { to: '/members', label: t('nav.members') },
  ];

  // Secondary pages under More (map/stats/about stay out of easy mode).
  const moreNav = [
    { to: '/related', label: t('nav.related'), easy: true },
    { to: '/timeline', label: t('nav.timeline'), easy: true },
    { to: '/map', label: t('nav.map'), easy: false },
    { to: '/statistics', label: t('nav.stats'), easy: false },
    { to: '/about', label: t('nav.about'), easy: false },
  ].filter((item) => !easy || item.easy);

  const mobileNav = [
    ...primaryNav,
    { to: '/settings', label: t('nav.settings') },
    ...moreNav,
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-200'
        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-100'
    }`;

  const iconBtnClass = ({ isActive }: { isActive: boolean }) =>
    `icon-btn !min-h-10 !min-w-10 ${
      isActive
        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
        : ''
    }`;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--shajira-page,#e7e5e4)] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[90] focus:rounded-lg focus:bg-brand-700 focus:px-3 focus:py-2 focus:text-white"
      >
        {t('nav.skip')}
      </a>
      <header className="sticky top-0 z-40 border-b border-stone-300/80 bg-[var(--shajira-panel,#e7e5e4)]/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-1.5 px-3 sm:h-14 sm:gap-2 sm:px-5">
          <NavLink
            to="/"
            className="flex min-w-0 items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            {/* Mark always; wordmark from sm up — keeps the bar compact on phones */}
            <span className="sm:hidden">
              <BrandLogo size="sm" wordmark={false} />
            </span>
            <span className="hidden sm:inline-flex">
              <BrandLogo size="sm" />
            </span>
          </NavLink>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label={t('nav.mainNav')}>
            {primaryNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
            {moreNav.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  className={linkClass({ isActive: moreOpen })}
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  {t('nav.more')}
                  <ChevronDown className="ml-0.5 inline h-4 w-4" aria-hidden />
                </button>
                {moreOpen && (
                  <ul className="absolute right-0 z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                    {moreNav.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-3.5 py-2 text-sm font-medium ${
                              isActive
                                ? 'bg-brand-50 text-brand-900 dark:bg-brand-950/50 dark:text-brand-200'
                                : 'text-stone-800 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800'
                            }`
                          }
                          onClick={() => setMoreOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
            <button
              type="button"
              className="icon-btn !min-h-10 !min-w-10 !gap-0.5 text-xs font-bold"
              onClick={cycleLanguage}
              title={t('nav.langCycle')}
              aria-label={t('nav.langCycle')}
            >
              <Languages className="h-4 w-4" aria-hidden />
              <span className="tabular-nums">{languageCodeLabel(settings.language)}</span>
            </button>
            <button
              type="button"
              className="icon-btn !min-h-10 !min-w-10"
              onClick={toggleTheme}
              title={settings.theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
              aria-label={settings.theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            >
              {settings.theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden />
              ) : (
                <Moon className="h-5 w-5" aria-hidden />
              )}
            </button>
            <NavLink
              to="/settings"
              className={iconBtnClass}
              title={t('nav.settings')}
              aria-label={t('nav.settings')}
              onClick={() => setMenuOpen(false)}
            >
              <Settings className="h-5 w-5" aria-hidden />
            </NavLink>
            <button
              type="button"
              className="icon-btn !min-h-10 !min-w-10 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className="animate-fade-in border-t border-stone-200 bg-white px-3 py-2 lg:hidden dark:border-stone-800 dark:bg-stone-950"
            aria-label={t('nav.mobileNav')}
          >
            <ul className="flex flex-col gap-0.5">
              {mobileNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `block w-full rounded-xl px-3.5 py-2.5 text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-200'
                          : 'text-stone-800 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800'
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none pb-20 lg:pb-0">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
        {!isTreePage && (
          <footer className="mt-auto border-t border-stone-200 px-4 py-4 dark:border-stone-800">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="text-center text-xs text-stone-500 dark:text-stone-400 sm:text-left">
                {t('footer.note')}
              </p>
              <MadeByKadir />
            </div>
          </footer>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
