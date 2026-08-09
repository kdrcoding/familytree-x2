import { NavLink } from 'react-router-dom';
import { Home, Settings, TreePine, Users } from 'lucide-react';
import { useT } from '../i18n/useT';

/** Phone app shell — four tabs only. Secondary pages live in the header menu. */
const TABS = [
  { to: '/', labelKey: 'nav.home' as const, icon: Home, end: true },
  { to: '/tree', labelKey: 'nav.tree' as const, icon: TreePine, end: false },
  { to: '/members', labelKey: 'nav.members' as const, icon: Users, end: false },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: Settings, end: false },
];

export function BottomNav() {
  const t = useT();

  return (
    <nav
      className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/90 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(28_25_23/0.06)] backdrop-blur-lg lg:hidden dark:border-stone-800 dark:bg-stone-950/95 dark:shadow-[0_-4px_20px_rgb(0_0_0/0.35)]"
      aria-label={t('nav.bottomNav')}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-0 px-1.5 pt-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-center transition-colors ${
                    isActive
                      ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
                      : 'text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                <span className="max-w-full truncate text-[0.65rem] font-bold leading-none tracking-wide">
                  {t(tab.labelKey)}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
