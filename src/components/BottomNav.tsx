import { NavLink } from 'react-router-dom';
import { Home, Settings, TreePine, Users } from 'lucide-react';
import { useT } from '../i18n/useT';

/** Four clear tabs — Settings is the gear (same as the header icon). */
const TABS = [
  { to: '/', labelKey: 'nav.home' as const, icon: Home, end: true },
  { to: '/tree', labelKey: 'nav.tree' as const, icon: TreePine, end: false },
  { to: '/members', labelKey: 'nav.members' as const, icon: Users, end: false },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: Settings, end: false },
];

/**
 * Fixed bottom tabs on phones. Compact labels + icons.
 * Hidden from lg up (desktop keeps the top nav + settings gear).
 */
export function BottomNav() {
  const t = useT();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-950/95"
      aria-label={t('nav.bottomNav')}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-0.5 px-1.5 pt-0.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-center transition-colors ${
                    isActive
                      ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
                      : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="max-w-full truncate text-[0.65rem] font-bold leading-tight tracking-wide">
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
