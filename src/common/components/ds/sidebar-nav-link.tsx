import type { ReactNode } from 'react';
import { cn } from '@/common/lib/cn';

export type SidebarNavLinkProps = {
  /** Persian label text */
  label: string;
  /** Lucide (or any) icon element */
  icon?: ReactNode;
  /** href for `<a>` — omit for a button-role item */
  href?: string;
  /** Marks this item as the currently active route */
  active?: boolean;
  /** Renders the left-edge red accent bar on the active item */
  accentBar?: boolean;
  /** Optional extra classes on the root element */
  className?: string;
  onClick?: () => void;
};

/**
 * SidebarNavLink — a single item in the profile/account sidebar navigation.
 *
 * Design tokens (exact match to /profile design):
 *   - Height: 52px, full-width
 *   - Background: brand-bg (idle) / white with red left border (active)
 *   - Border radius: rounded-[10px]
 *   - Active state: 4px brand-red bar on the right edge, text stays brand-ink
 *   - Icon: inline-flex, size-5, text-brand-red on active / text-brand-mute idle
 *   - Font: text-sm font-medium RTL
 *
 * Placed in `ds/` because it is a brand-styled primitive reusable across any
 * page that needs sidebar navigation (profile, orders, settings, …).
 */
export function SidebarNavLink({
  label,
  icon,
  href,
  active = false,
  accentBar = true,
  className,
  onClick,
}: SidebarNavLinkProps) {
  const base = cn(
    // Layout
    'relative flex items-center justify-between w-full',
    'h-[52px] px-4 rounded-[10px]',
    // Typography
    'text-sm font-medium text-brand-ink select-none',
    // Transitions
    'transition-colors duration-150 ease-out',
    // Idle / hover
    active
      ? 'bg-white shadow-[0_1px_8px_rgb(0_0_0/0.06)]'
      : 'bg-brand-bg hover:bg-white hover:shadow-[0_1px_8px_rgb(0_0_0/0.04)] cursor-pointer',
    className,
  );

  const inner = (
    <>
      {/* Right edge accent bar — only visible on active */}
      {accentBar && active && (
        <span
          aria-hidden
          className="absolute right-0 top-[20%] h-[60%] w-[4px] rounded-l-full bg-brand-red"
        />
      )}

      {/* Label (RTL: label on right, icon on left) */}
      <span className="flex-1 text-right pr-1">{label}</span>

      {/* Icon */}
      {icon && (
        <span
          className={cn(
            'inline-flex items-center justify-center size-5 shrink-0 ms-3',
            active ? 'text-brand-red' : 'text-brand-mute',
          )}
        >
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} aria-current={active ? 'page' : undefined} className={base}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={base}>
      {inner}
    </button>
  );
}
