import { cn } from '@/common/lib/cn';
import { Button } from '../ui/button';

export type FeatureCardProps = {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  imageAlt?: string;
  decoration?: 'shrimp';
};

export function FeatureCard({
  title,
  subtitle,
  cta,
  image,
  imageAlt = '',
  decoration,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        '@container',
        'relative w-full flex items-center overflow-hidden xl:gap-x-16 rounded-[20px] bg-brand-bg',
        'min-h-60',
        // "grid grid-cols-1 @[26rem]:grid-cols-[1fr_auto]",
        'items-center',
      )}>
      

      {/* image column: cream circle + product image */}
      <div
        className={cn(
          'relative bg-red-300 flex items-center',
          'max-h-44 max-w-44 w-full h-full mx-auto',
          'mt-6 mb-2 @[26rem]:my-0',
        )}>
        <div
          aria-hidden
          className='w-full h-full rounded-full bg-brand-cream'></div>
        <img
          src={image}
          alt={imageAlt}
          className='absolute z-1 w-full -left-5 p-3'
        />
        {decoration === 'shrimp' && (
          <img
            src='/assets/cat-shrimp.png'
            alt=''
            aria-hidden
            className='absolute -bottom-1 left-2 h-18.25 w-20.75 -scale-x-100 object-contain'
          />
        )}
      </div>

      {/* text column */}
      <div
        className={cn(
          'flex flex-col gap-4.5 text-right',
          'px-6 py-6 @[26rem]:px-8 @[26rem]:py-8',
        )}>
        <h3 className='font-khodkar text-4xl leading-none text-fluid-card text-brand-ink'>
          {title}
        </h3>
        <p className='text-sm md:text-base text-brand-ink leading-tight'>{subtitle}</p>
        <Button
          variant='cream'
          size='lg'
          className='w-42.5 font-normal text-base'>
          {cta}
        </Button>
      </div>
    </article>
  );
}
