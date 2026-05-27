'use client';

import { useState } from 'react';
import { Container } from '@/common/components/ds';
import { ProfileBreadcrumb } from './profile-breadcrumb';
import { ProfileSidebar } from './profile-sidebar';
import { EditProfilePanel } from './edit-profile-panel';
import { ChangePasswordPanel } from './change-password-panel';
import { OrdersPanel } from './orders-panel';
import { ProfileServiceStrip } from './profile-service-strip';
import { type ProfileSection } from '../data/profile-content';

/**
 * ProfileClientPage — interactive shell for /profile.
 *
 * Layout (desktop, RTL):
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Breadcrumb                                   (full width)  │
 *   ├──────────────────────────┬──────────────────────────────────┤
 *   │  Main content panel      │  ProfileSidebar (240px fixed)    │
 *   │  (EditProfile |          │                                  │
 *   │   ChangePassword |       │  - ویرایش حساب                   │
 *   │   Orders)                │  - تنظیمات رمز عبور              │
 *   │                          │  - سفارش ها                      │
 *   │                          │  - خروج                          │
 *   └──────────────────────────┴──────────────────────────────────┘
 *   ProfileServiceStrip                             (full width)
 *
 * Mobile: sidebar stacks above main content (sidebar first, then panel).
 *
 * All section-switching state lives here so the route stays a Server Component
 * at the top level.
 */
export function ProfileClientPage() {
  const [activeSection, setActiveSection] = useState<ProfileSection>('edit-profile');

  const handleSectionChange = (section: ProfileSection) => {
    if (section === 'logout') {
      // TODO: trigger logout / redirect to home
      console.log('logout');
      return;
    }
    setActiveSection(section);
  };

  return (
    <div className="flex-1 bg-white" dir="rtl">
      <Container>
        {/* Breadcrumb */}
        <ProfileBreadcrumb />

        {/* Main layout: content left (in RTL = visually left) + sidebar right */}
        <div className="flex flex-col lg:flex-row gap-6 pb-16 items-start">
          {/* ── Sidebar — right column on desktop, top on mobile ── */}
          <div className="w-full lg:w-[230px] xl:w-[250px] shrink-0 order-1 lg:order-2">
            <ProfileSidebar
              activeSection={activeSection}
              onSelect={handleSectionChange}
            />
          </div>

          {/* ── Main content panel — left column on desktop ── */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            <div className="bg-white border border-brand-line rounded-[18px] p-6 sm:p-8">
              {activeSection === 'edit-profile' && <EditProfilePanel />}
              {activeSection === 'change-password' && <ChangePasswordPanel />}
              {activeSection === 'orders' && <OrdersPanel />}
            </div>
          </div>
        </div>

        {/* Service features strip */}
        <div className="pb-16">
          <ProfileServiceStrip />
        </div>
      </Container>
    </div>
  );
}
