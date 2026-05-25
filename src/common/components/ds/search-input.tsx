import { Search } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Input } from '../ui/input';

/**
 * Search field — pill-rounded input with leading red search icon. The
 * placeholder colour also reads red, matching the Meat Plus design.
 */
export function SearchInput({
  placeholder = 'جست و جو محصول....',
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5',
        'h-11 w-full max-w-[285px] sm:w-[285px]',
        'px-3 rounded-[12px] border border-brand-line bg-white',
        'text-brand-red',
        'focus-within:ring-2 focus-within:ring-brand-red/30',
        className,
      )}>
      <Input
        className='text-xs text-brand-red text-right'
        placeholder={placeholder}
        aria-label='جستجوی محصول'
      />
      <Search
        className='size-5 shrink-0'
        strokeWidth={2}
      />
    </label>
  );
}
