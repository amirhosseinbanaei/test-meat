import { MapPin, Phone, Mail, Hash } from 'lucide-react';
import { contactInfo, MAP_EMBED_URL } from '../data/contact-content';

/**
 * ContactInfoPanel — right-side panel on the /contact page.
 *
 * Shows:
 *   • Embedded Google Map (iframe, lazy-loaded)
 *   • Address, postal code, phone, email in a clean RTL list
 */
export function ContactInfoPanel() {
  return (
    <div className="flex flex-col gap-6 w-full" dir="rtl">
      {/* Map embed */}
      <div className="w-full rounded-[16px] overflow-hidden border border-brand-line shadow-[0_2px_16px_rgb(0_0_0/0.07)]">
        <iframe
          src={MAP_EMBED_URL}
          width="100%"
          height="280"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="موقعیت میت پلاس روی نقشه"
          className="w-full sm:h-[320px] lg:h-[280px]"
        />
      </div>

      {/* Info list */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-brand-ink">اطلاعات تماس:</h3>

        <ul className="flex flex-col gap-3.5">
          {/* Address */}
          <li className="flex items-start gap-3">
            <MapPin
              className="size-4 text-brand-red shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <span className="text-sm font-light text-brand-ink leading-relaxed">
              <b className="font-bold">آدرس.</b>{' '}
              {contactInfo.address}
            </span>
          </li>

          {/* Postal code */}
          <li className="flex items-center gap-3">
            <Hash
              className="size-4 text-brand-red shrink-0"
              strokeWidth={2}
            />
            <span className="text-sm font-light text-brand-ink">
              <b className="font-bold">کدپستی:</b>{' '}
              {contactInfo.postalCode}
            </span>
          </li>

          {/* Phone */}
          <li className="flex items-center gap-3">
            <Phone
              className="size-4 text-brand-red shrink-0"
              strokeWidth={2}
            />
            <span className="text-sm font-light text-brand-ink">
              <b className="font-bold">تلفن تماس:</b>{' '}
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="hover:text-brand-red transition-colors"
                dir="ltr"
              >
                {contactInfo.phone}
              </a>
            </span>
          </li>

          {/* Email */}
          <li className="flex items-center gap-3">
            <Mail
              className="size-4 text-brand-red shrink-0"
              strokeWidth={2}
            />
            <span className="text-sm font-light text-brand-ink">
              <b className="font-bold">ایمیل.</b>{' '}
              <a
                href={`mailto:${contactInfo.email}`}
                className="hover:text-brand-red transition-colors"
                dir="ltr"
              >
                {contactInfo.email}
              </a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
