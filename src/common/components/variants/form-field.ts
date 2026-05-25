import { cva, type VariantProps } from 'class-variance-authority';
import { focusRing, transitionFast, disabled } from './_shared';

/**
 * FormField variant matrix — the visual shell for every labeled input in the
 * project (text, textarea, select).  The `state` variant switches between the
 * idle brand border, a focused red glow, and a destructive-red error state.
 */
export const formFieldVariants = cva(
  [
    'w-full bg-white text-right',
    'border rounded-[10px]',
    'text-sm font-light text-brand-ink',
    'placeholder:text-brand-mute',
    transitionFast,
    focusRing,
    disabled,
  ].join(' '),
  {
    variants: {
      state: {
        idle:  'border-brand-line',
        focus: 'border-brand-red ring-2 ring-brand-red/20',
        error: 'border-brand-red bg-red-50/30',
      },
      fieldSize: {
        md: 'h-[50px] px-4 py-3',
        lg: 'h-[50px] px-4 py-3',
      },
    },
    defaultVariants: {
      state: 'idle',
      fieldSize: 'md',
    },
  },
);

export type FormFieldVariants = VariantProps<typeof formFieldVariants>;
