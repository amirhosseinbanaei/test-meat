import {
  AparatGlyph,
  Container,
  InstagramGlyph,
  Logo,
  SocialIconLink,
  TelegramGlyph,
  YoutubeGlyph,
} from "@/common/components/ds";
import {
  footerAbout,
  footerContact,
  footerCopyright,
  footerQuickLinks,
} from "../data/home-content";

/**
 * Section 10 — Site footer. Large top-start curve (583px at design scale),
 * a 4-column meta grid (brand+about / quick links / contact / trust badges),
 * a hairline divider, then a baseline row carrying the copyright and the
 * social icons. The whole footer collapses to a single column on mobile.
 */
export function SiteFooter() {
  return (
    <footer
      className="relative mt-12 bg-white shadow-[0_-7px_25px_rgb(0_0_0/0.08)] rounded-tl-curve-lg"
    >
      <Container className="pt-16 sm:pt-20 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.05fr_0.7fr_0.7fr_1fr] gap-10 lg:gap-14 text-right">
          {/* brand + about */}
          <div className="flex flex-col gap-3">
            <Logo size="footer" />
            <p className="mt-1 text-sm leading-[1.9] font-light text-brand-ink text-justify">
              {footerAbout}
            </p>
          </div>

          {/* quick links */}
          <nav aria-label="دسترسی سریع" className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-bold text-brand-ink">
              دسترسی سریع
            </h4>
            {footerQuickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-light text-brand-ink hover:text-brand-red transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* contact */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-bold text-brand-ink">
              اطلاعات تماس
            </h4>
            {footerContact.map((entry) => (
              <div
                key={entry.label}
                className="flex flex-row-reverse justify-end gap-1.5 text-sm font-light leading-[1.7] text-brand-ink"
              >
                <b className="font-bold text-brand-ink">{entry.label}</b>
                <span>{entry.value}</span>
              </div>
            ))}
          </div>

          {/* trust badges */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-bold text-brand-ink">
              نماد اعتماد
            </h4>
            <div className="flex flex-wrap items-start gap-4">
              <img
                src="/assets/enamad.png"
                alt="نماد اعتماد الکترونیکی eNamad"
                className="h-24 w-auto object-contain"
              />
              <img
                src="/assets/samandehi.png"
                alt="ساماندهی"
                className="h-24 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        <hr className="my-6 sm:my-7 border-t border-brand-line-strong" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-light text-brand-ink">
            {footerCopyright}
          </span>
          <div className="flex items-center gap-2 text-sm text-brand-ink">
            <SocialIconLink
              href="#"
              label="تلگرام"
              Icon={TelegramGlyph}
            />
            <SocialIconLink
              href="#"
              label="یوتیوب"
              Icon={YoutubeGlyph}
            />
            <SocialIconLink
              href="#"
              label="اینستاگرام"
              Icon={InstagramGlyph}
            />
            <SocialIconLink href="#" label="آپارات" Icon={AparatGlyph} />
            <span className="ms-2">ما را دنبال کنید</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
