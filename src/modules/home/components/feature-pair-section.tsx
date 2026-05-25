import { Container, FeatureCard } from '@/common/components/ds';
import type { FeatureCardData } from '../data/home-content';

export function FeaturePairSection({ cards }: { cards: FeatureCardData[] }) {
  return (
    <section className='mt-10 sm:mt-14'>
      <Container>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6'>
          {cards.map((card) => (
            <FeatureCard
              key={card.id}
              title={card.title}
              subtitle={card.subtitle}
              cta={card.cta}
              image={card.image}
              imageAlt={card.title}
              decoration={card.decoration}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
