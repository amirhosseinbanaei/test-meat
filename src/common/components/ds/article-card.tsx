import { ChevronDown } from 'lucide-react';
import { cn } from '@/common/lib/cn';

/**
 * Article card — image with a date chip on the start edge, then title,
 * lede paragraph, red rule, and a "more" link.
 *
 * The "more" link sits in the bottom-end corner of the card (visually
 * left in RTL) so a row of cards keeps a clear horizontal rhythm.
 */
export type ArticleCardProps = {
  image: string;
  imageAlt?: string;
  day: string;
  month: string;
  title: string;
  body: string;
  href?: string;
  className?: string;
};

export function ArticleCard({
  image,
  imageAlt = '',
  day,
  month,
  title,
  body,
  href = '#',
  className,
}: ArticleCardProps) {
  return (
    <article className={cn('relative flex w-full flex-col pb-12', className)}>
      {/* thumbnail with date chip */}
      <div className='relative h-[248px] w-full overflow-hidden rounded-[10px] bg-brand-line'>
        <img
          src={image}
          alt={imageAlt}
          className='h-full w-full object-cover'
          loading='lazy'
        />
        <div className='absolute bottom-4 right-0 flex h-[41px] items-baseline gap-1.5 rounded-l-[10px] bg-white/85 px-3.5 text-brand-ink backdrop-blur-sm'>
          <span className='text-2xl font-bold leading-[41px]'>{day}</span>
          <span className='text-base'>{month}</span>
        </div>
      </div>

      <span className='mt-5 flex justify-between items-center'>
        <h3 className='text-right text-base font-medium text-brand-ink'>
          {title}
        </h3>
        <a
          href={href}
          className='inline-flex items-center gap-1.5 text-sm font-bold text-brand-red hover:underline'>
          بیشتر
          <ChevronDown
            className='size-2.5 fill-brand-red text-brand-red'
            strokeWidth={2.5}
          />
        </a>
      </span>
      <div className='mt-2.5 h-px bg-brand-red my-2.5' />
      <p className='mt-3 line-clamp-2 h-[46px] overflow-hidden text-right text-sm leading-[1.6] text-brand-ink'>
        {body}
      </p>
    </article>
  );
}
