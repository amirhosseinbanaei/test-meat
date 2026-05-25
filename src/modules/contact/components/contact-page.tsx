import { Container } from '@/common/components/ds';
import { SiteHeader } from '../../home/components/site-header';
import { SiteFooter } from '../../home/components/site-footer';
import { ContactHeroBanner } from './contact-hero-banner';
import { ContactForm } from './contact-form';
import { ContactInfoPanel } from './contact-info-panel';
import { ServiceFeaturesStrip } from './service-features-strip';

/**
 * ContactPage — full /contact page composition.
 *
 * Layout (desktop, RTL):
 *   SiteHeader
 *   ContactHeroBanner          (full width)
 *   ┌──────────────────────────────────────────┐
 *   │  Section title (right-aligned)           │
 *   ├───────────────────────┬──────────────────┤
 *   │  ContactForm (2/3)    │  ContactInfoPanel │
 *   │                       │  (1/3) map+info  │
 *   └───────────────────────┴──────────────────┘
 *   ServiceFeaturesStrip     (full width band)
 *   SiteFooter
 *
 * Mobile: single column — form stacks above info panel.
 */
export function ContactPage() {
  return (
    <div
      className="bg-white text-brand-ink overflow-x-hidden min-h-screen"
      dir="rtl"
    >
      <SiteHeader />

      <ContactHeroBanner />

      <Container className="py-12 sm:py-16 lg:py-20">
        {/* Section heading */}
        <div className="mb-10 sm:mb-12 text-right">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-ink leading-tight">
            تماس با ما
          </h1>
          <p className="mt-2 text-sm font-light text-brand-mute leading-relaxed max-w-xl">
            برای هرگونه سوال، پیشنهاد یا انتقاد، فرم زیر را تکمیل کنید. کارشناسان
            ما در اولین فرصت با شما تماس خواهند گرفت.
          </p>
          {/* Red underline accent */}
          <div className="mt-4 h-[3px] w-14 rounded-full bg-brand-red" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">
          {/* Form — left on desktop, first on mobile */}
          <div className="order-2 lg:order-1">
            {/* Inner card */}
            <div className="bg-white rounded-[18px] border border-brand-line shadow-[0_2px_24px_rgb(0_0_0/0.06)] p-6 sm:p-8 lg:p-10">
              <h2 className="text-base font-bold text-brand-ink mb-6">
                ارسال پیام
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Info panel — right on desktop, second on mobile */}
          <div className="order-1 lg:order-2">
            <ContactInfoPanel />
          </div>
        </div>

        {/* Service features strip — full width */}
        <div className="mt-16 sm:mt-20">
          <ServiceFeaturesStrip />
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}
