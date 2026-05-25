import { cn } from '@/common/lib/cn';
import { LogoMark } from './brand-icons';

export function Logo({
  size = 'header',
  className,
}: {
  size?: 'header' | 'footer';
  className?: string;
}) {
  const wordSize = size === 'footer' ? 'text-[34px]' : 'text-[30px]';
  const markSize = size === 'footer' ? 'size-8' : 'size-7';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <LogoMark className={`${markSize} `} />
      <span
        className={cn(
          'font-display leading-none tracking-[0.5px] text-brand-ink mt-3',
          wordSize,
        )}>
        Meat Plus
      </span>
    </div>
  );
}
