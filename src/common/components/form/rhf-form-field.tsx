'use client';

import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { FormField } from '@/common/components/ds';

/**
 * RhfFormField — React Hook Form wrapper around the ds `<FormField />`.
 *
 * Lives in `common/components/form/` (the locked third layer):
 *   ui/ → ds/ → form/
 *
 * Accepts `as="textarea"` to render a textarea; defaults to `as="input"`.
 * Connects to the nearest RHF `<FormProvider>` and surfaces validation
 * errors via the ds FormField's `error` prop.
 */
type RhfFormFieldProps<T extends FieldValues = FieldValues> = {
  name: FieldPath<T>;
  as?: 'input' | 'textarea';
  label?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  'aria-label'?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
};

export function RhfFormField<T extends FieldValues = FieldValues>({
  name,
  as = 'input',
  label,
  placeholder,
  type,
  inputMode,
  autoComplete,
  'aria-label': ariaLabel,
  rows,
  className,
  disabled,
}: RhfFormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  // Walk the dot-path to find the nested error message
  const error = (
    name
      .split('.')
      .reduce(
        (acc: Record<string, unknown> | undefined, key) =>
          acc && typeof acc === 'object'
            ? (acc[key] as Record<string, unknown>)
            : undefined,
        errors as Record<string, unknown>,
      ) as { message?: string } | undefined
  )?.message;

  const registerProps = register(name);

  if (as === 'textarea') {
    return (
      <FormField
        as="textarea"
        label={label}
        error={error}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={rows}
        className={className}
        disabled={disabled}
        {...registerProps}
      />
    );
  }

  return (
    <FormField
      as="input"
      label={label}
      error={error}
      placeholder={placeholder}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      {...registerProps}
    />
  );
}
