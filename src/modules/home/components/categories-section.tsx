import {
  Carousel,
  CarouselArrows,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselViewport,
  CategoryTile,
  Container,
  SectionTitle,
} from '@/common/components/ds';
import { categoriesRowOne, categoriesRowTwo } from '../data/home-content';

/**
 * Section 04 — "دسته بندی محصولات".
 *
 * Twelve category tiles laid out as a carousel — slides scroll through a
 * peek window so the next tiles are always partially visible (the design's
 * affordance to "there is more"). On wide screens we still see roughly 6
 * tiles per slide, on tablets 4, on mobile 3 — driven by per-item
 * responsive flex-basis rather than a JS slidesPerView measurement.
 *
 * The background is the soft cream wash plus the texture image at low
 * opacity, exactly as in the design.
 */
const allCategories = [...categoriesRowOne, ...categoriesRowTwo];

export function CategoriesSection() {
  return (
    <section
      className='relative overflow-hidden bg-brand-cream-soft py-14 sm:py-20 lg:py-24 mt-12'
      aria-label='دسته بندی محصولات'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-multiply'
        style={{ backgroundImage: "url('/assets/categories-bg.jpg')" }}
      />

      <Container className='relative'>
        <SectionTitle
          align='center'
          className='text-5xl font-khodkar'>
          دسته بندی محصولات
        </SectionTitle>

        <div className='w-full mt-9 gap-8 justify-center grid grid-cols-2  min-[470px]:grid-cols-3 sm:grid-cols-4 xl:grid-cols-6'>
          {allCategories.map((category) => (
            <CategoryTile
              key={category.label}
              label={category.label}
              image={category.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Empty placeholder that keeps title centring stable above the title row. */
function CarouselArrowsPlaceholder() {
  return (
    <div
      className='hidden lg:block w-[104px]'
      aria-hidden
    />
  );
}
