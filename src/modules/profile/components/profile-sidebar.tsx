'use client';

import {
  Pencil,
  Lock,
  ShoppingBag,
  LogOut,
} from 'lucide-react';
import { SidebarNavLink } from '@/common/components/ds';
import { profileNavItems, type ProfileSection } from '../data/profile-content';

type ProfileSidebarProps = {
  activeSection: ProfileSection;
  onSelect: (section: ProfileSection) => void;
};

/** Maps icon key → Lucide element */
function NavIcon({ icon }: { icon: string }) {
  const cls = 'size-[18px]';
  switch (icon) {
    case 'edit':   return <Pencil      className={cls} strokeWidth={1.8} />;
    case 'lock':   return <Lock        className={cls} strokeWidth={1.8} />;
    case 'orders': return <ShoppingBag className={cls} strokeWidth={1.8} />;
    case 'logout': return <LogOut      className={cls} strokeWidth={1.8} />;
    default:       return null;
  }
}

/**
 * ProfileSidebar — RTL vertical nav used on /profile.
 *
 * Layout (exact design match):
 *   - White card, border border-brand-line, rounded-[18px], p-3
 *   - Stacked SidebarNavLink items, gap-2
 *   - Active item has right-edge red bar + white bg
 *   - "خروج" item styled with text-brand-red icon to signal destructive action
 *
 * Placed in `modules/profile/components/` because it is specific to the
 * profile feature (it carries profile-specific section IDs and labels).
 */
export function ProfileSidebar({ activeSection, onSelect }: ProfileSidebarProps) {
  return (
    <aside
      className="w-full bg-white border border-brand-line rounded-[18px] p-3 flex flex-col gap-2"
      aria-label="منوی حساب کاربری"
      dir="rtl"
    >
      {profileNavItems.map((item) => (
        <SidebarNavLink
          key={item.id}
          label={item.label}
          icon={<NavIcon icon={item.icon} />}
          active={activeSection === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </aside>
  );
}
