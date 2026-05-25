import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/common/lib/cn';
import { formFieldVariants } from '../variants/form-field';

/**
 * FormField — design-system labeled field shell.
 *
 * Renders either an `<input>` or a `<textarea>` depending on `as`.
 * Error state is communicated via the `error` prop (string message).
 * All native input/textarea attributes are forwarded through.
 *
 * Sits in `ds/` because it carries the brand visual contract; the `form/`
 * layer wrappers (RHF-connected) compose this component.
 */

type BaseProps = {
  label?: string;
  error?: string;
  className?: string;
};

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input';
  };

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
    rows?: number;
  };

export type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField({
  label,
  error,
  className,
  as = 'input',
  ...props
}: FormFieldProps) {
  const state = error ? 'error' : 'idle';
  const fieldClass = cn(
    formFieldVariants({ state }),
    as === 'textarea' && 'h-auto resize-none py-3',
    className,
  );

  return (
    <div className="flex flex-col gap-1.5 w-full" dir="rtl">
      {label && (
        <label className="text-xs font-medium text-brand-ink">{label}</label>
      )}

      {as === 'textarea' ? (
        <textarea
          className={fieldClass}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={fieldClass}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p role="alert" className="text-xs text-brand-red font-light mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
