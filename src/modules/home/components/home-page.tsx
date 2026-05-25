import { featureCardsBottom, featureCardsTop } from '../data/home-content';
import { ArticlesSection } from './articles-section';
import { BestSellersSection } from './best-sellers-section';
import { CategoriesSection } from './categories-section';
import { FeaturePairSection } from './feature-pair-section';
import { HeroSection } from './hero-section';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { SpecialDiscountSection } from './special-discount-section';
import { WhyMeatPlusSection } from './why-meat-plus-section';

export function HomePage() {
  return (
    <main className='bg-white text-brand-ink overflow-x-hidden'>
      <SiteHeader />
      
      <HeroSection />

      <FeaturePairSection cards={featureCardsTop} />

      <CategoriesSection />

      <WhyMeatPlusSection />

      <SpecialDiscountSection />

      <FeaturePairSection cards={featureCardsBottom} />

      <BestSellersSection />

      <ArticlesSection />

      <SiteFooter />
    </main>
  );
}
