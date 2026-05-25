import { Container } from '@/common/components/ds';
import { heroSlides } from '../data/home-content';
import { HeroCarousel } from './hero-carousel';

/**
 * Section 02 — Hero. A 3-slide auto-rotating carousel (Embla, RTL, loop +
 * autoplay every 6s). Pagination dots are centred at the bottom; prev /
 * next arrows sit in the bottom-end corner, exactly as in the design.
 *
 * Server-rendered shell, client-rendered carousel — only `<HeroCarousel/>`
 * carries `'use client'` (it has to, because it owns the Embla Autoplay
 * plugin instance, which is non-serialisable).
 */
export function HeroSection() {
  return (
    <section className='mt-5 sm:mt-6 flex justify-center xl:justify-end relative mx-auto w-full max-w-330 xl:max-w-full'>
      <HeroCarousel slides={heroSlides} />

      <div
        aria-hidden
        className='pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 xl:flex items-center gap-3 -rotate-90 origin-center xl:-right-14 xl:top-28'>
        <span className='block h-[3px] w-9 rounded-full bg-brand-red' />
        <span className='whitespace-nowrap text-sm font-light tracking-wide text-brand-ink'>
          تازه ترین محصولات پروتئینی
        </span>
      </div>
    </section>
  );
}
