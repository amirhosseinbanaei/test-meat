import { cva, type VariantProps } from "class-variance-authority";
import { disabled, focusRing, transitionFast } from "./_shared";

/**
 * Button variant matrix used by `<Button/>` in the `ui/` layer.
 * The variant set covers every button shape in the Meat Plus design:
 *
 *  - `olive`   — primary CTA on light surfaces (header nav CTA, product cards).
 *  - `cream`   — secondary CTA on cards / hero panels.
 *  - `outline` — ink-bordered CTA (Why Meat Plus secondary action).
 *  - `redGhost` — borderless CTA used inside red panels (slider chrome).
 *  - `ghost`   — borderless dark-text CTA (article "view all", best-sellers).
 *  - `link`    — minimal red link (article "more").
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-medium select-none cursor-pointer",
    transitionFast,
    focusRing,
    disabled,
  ].join(" "),
  {
    variants: {
      variant: {
        olive: "bg-brand-olive text-brand-ink hover:brightness-95",
        cream: "bg-brand-cream text-brand-ink hover:brightness-95",
        outline:
          "border border-brand-ink text-brand-ink bg-transparent hover:bg-brand-ink/5",
        redGhost: "text-white bg-transparent hover:bg-white/10",
        ghost: "text-brand-ink bg-transparent hover:bg-brand-ink/5",
        link: "text-brand-red font-bold hover:underline gap-1.5 p-0",
        soft: "bg-brand-bg text-brand-red hover:bg-brand-bg/80",
      },
      size: {
        sm: "h-9 px-4 rounded-[8px] text-sm",
        md: "h-[42px] px-5 rounded-[12px] text-[13px]",
        lg: "h-[47px] px-6 rounded-[10px] text-base",
        pill: "h-[38px] px-4 rounded-[10px] text-sm",
        icon: "h-[46px] w-11 rounded-[10px]",
        link: "h-auto p-0 text-sm",
      },
    },
    defaultVariants: {
      variant: "olive",
      size: "lg",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
