/**
 * Shared CVA token strings used across the project's variant files.
 * Centralising them keeps focus-rings / disabled treatment / radii
 * consistent across the `ui/` and `ds/` layers.
 */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const disabled = "disabled:opacity-50 disabled:pointer-events-none";

export const transitionFast = "transition-[transform,background-color,color,opacity,filter] duration-150 ease-out";

export const minTouch = "min-h-[var(--size-touch)] min-w-[var(--size-touch)]";

/** Pill-button radius shared by Header CTA, Hero arrows, all-products buttons. */
export const pillRadius = "rounded-[10px]";

/** Card radius (feature card, product card, article thumb …). */
export const cardRadius = "rounded-[18px]";
