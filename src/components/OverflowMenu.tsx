import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { useT } from '../i18n/useT';

export interface OverflowMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

type Coords = { top: number; left: number; minWidth: number };

/** Above Leaflet map panes (~400–1000) and React Flow chrome. */
const MENU_Z = 10000;

function placeMenu(
  btn: HTMLElement,
  menu: HTMLElement | null,
  align: 'left' | 'right',
): Coords {
  const r = btn.getBoundingClientRect();
  const menuW = Math.max(200, menu?.offsetWidth ?? 200);
  const menuH = menu?.offsetHeight ?? 160;
  const gap = 6;
  let left = align === 'right' ? r.right - menuW : r.left;
  left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
  const below = r.bottom + gap;
  const top =
    below + menuH > window.innerHeight - 8 ? Math.max(8, r.top - gap - menuH) : below;
  return { top, left, minWidth: menuW };
}

/**
 * Compact ⋮ menu. Always portals to document.body with a z-index above maps.
 */
export function OverflowMenu({
  items,
  align = 'right',
  label,
}: {
  items: OverflowMenuItem[];
  align?: 'left' | 'right';
  label?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const visible = items.filter(Boolean);

  const place = useCallback(() => {
    if (!btnRef.current) return;
    setCoords(placeMenu(btnRef.current, menuRef.current, align));
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // Re-measure after paint so real menu height can flip above if needed.
    const id = requestAnimationFrame(() => place());
    return () => cancelAnimationFrame(id);
  }, [open, place, visible.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc, { passive: true });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="icon-btn !min-h-10 !min-w-10"
        aria-label={label ?? t('nav.more')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          if (!open && btnRef.current) {
            setCoords(placeMenu(btnRef.current, null, align));
          }
          setOpen((v) => !v);
        }}
      >
        <MoreVertical className="h-5 w-5" aria-hidden />
      </button>
      {open &&
        coords &&
        createPortal(
          <ul
            ref={menuRef}
            role="menu"
            style={{
              top: coords.top,
              left: coords.left,
              minWidth: coords.minWidth,
              zIndex: MENU_Z,
            }}
            className="fixed overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1.5 shadow-2xl shadow-stone-900/25 dark:border-stone-600 dark:bg-stone-900 dark:shadow-black/60"
          >
            {visible.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold disabled:opacity-40 ${
                    item.danger
                      ? 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40'
                      : 'text-stone-800 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800'
                  }`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}

/**
 * Same portal + z-index rules for any custom trigger (e.g. nav "More").
 */
export function PortalMenu({
  open,
  onClose,
  anchorRef,
  align = 'right',
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: 'left' | 'right';
  children: ReactNode;
}) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    if (!anchorRef.current) return;
    setCoords(placeMenu(anchorRef.current, menuRef.current, align));
  }, [anchorRef, align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const id = requestAnimationFrame(() => place());
    return () => cancelAnimationFrame(id);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc, { passive: true });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, onClose, place, anchorRef]);

  if (!open || !coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        top: coords.top,
        left: coords.left,
        minWidth: coords.minWidth,
        zIndex: MENU_Z,
      }}
      className="fixed overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-700 dark:bg-stone-900"
    >
      {children}
    </div>,
    document.body,
  );
}
