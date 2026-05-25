import { Container, SectionTitle, WhyFeature } from '@/common/components/ds';
import { Button } from '@/common/components/ui/button';
import { whyFeatures, whyList } from '../data/home-content';

export function WhyMeatPlusSection() {
  return (
    <section
      className='py-14 sm:py-20'
      aria-label='چرا میت پلاس'>
      <Container>
        <div className='flex flex-col xl:flex-row-reverse justify-between w-full'>
          {/* composite hero image */}
          <div className='relative w-full max-w-[549px]'>
            <div
              role='img'
              aria-label='ترکیب محصولات میت پلاس'
              className='mx-auto aspect-square w-full bg-contain bg-center bg-no-repeat'
              style={{ backgroundImage: "url('/assets/why-meat-plus.png')" }}
            />
          </div>

          {/* content column */}
          <div>
            <SectionTitle className='font-khodkar text-5xl'>
              چرا میت پلاس
            </SectionTitle>

            <ul className='mt-6 sm:mt-8 flex flex-col gap-4'>
              {whyList.map((item) => (
                <li
                  key={item}
                  className='flex items-start gap-2.5 text-base text-brand-ink leading-relaxed'>
                  <span
                    aria-hidden
                    className='font-medium text-brand-ink'>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className='mt-7 sm:mt-8 flex flex-wrap items-center gap-3'>
              <Button
                variant='cream'
                size='lg'
                className='w-[170px]'>
                مشاهده محصولات
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='w-[170px]'>
                مشاهده محصولات
              </Button>
            </div>

            <div className='mt-7 sm:mt-8 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-14'>
              {whyFeatures.map((feature) => (
                <WhyFeature
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  text={feature.text}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
