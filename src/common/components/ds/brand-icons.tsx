import type { SVGProps } from "react";
import { cn } from "@/common/lib/cn";

/**
 * Brand-specific iconography. Generic UI icons come from `lucide-react`; the
 * icons in this file are the Meat Plus mark and the four social-network
 * brand glyphs that aren't part of the Lucide set.
 */

/** Meat Plus logo mark — two overlapping L-shapes forming a "+/M" hint. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block",
        // Default size; consumers override via className.
        "size-7",
        className,
      )}
    >
      {/* horizontal bar */}
      <span className="absolute left-0 top-[34%] h-[32%] w-full rounded-[3px_18px_3px_3px] bg-brand-red" />
      {/* vertical bar */}
      <span className="absolute left-[34%] top-0 h-full w-[32%] rounded-[3px_18px_3px_3px] bg-brand-red" />
    </span>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export function TelegramGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.5 4.3 2.6 11.7c-1.3.5-1.3 1.3-.2 1.6l4.7 1.5 1.9 5.7c.3.7.2.9 1 .9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.2-.5-1.7-1.4-1.4z" />
    </svg>
  );
}

export function YoutubeGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 7s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.2-1C16.5 3.5 12 3.5 12 3.5s-4.5 0-7.9.2c-.5.1-1.4.1-2.2 1C1.2 5.4 1 7 1 7S.8 8.9.8 10.8v1.7c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.8 2.4.9 1.7.2 7.7.2 7.7.2s4.5 0 7.9-.3c.5-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.7c0-1.9-.2-3.8-.2-3.8zM9.7 14.9V8.5l5.8 3.2-5.8 3.2z" />
    </svg>
  );
}

export function InstagramGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4 1 .5.4.8.8 1 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-1 1.4-.4.5-.8.8-1.4 1-.4.2-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-1-.5-.4-.8-.8-1-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 1-1.4.4-.5.8-.8 1.4-1 .4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2c-.3.8-.5 1.6-.5 2.9C0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.2.3 2.1.6 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.5 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.2-.1 2.1-.3 2.9-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.5-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.2-.3-2.1-.5-2.9-.3-.8-.7-1.5-1.4-2.2-.7-.7-1.4-1.1-2.2-1.4-.8-.3-1.6-.5-2.9-.5C15.7 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6.4-11.9c-.8 0-1.4.6-1.4 1.4 0 .8.6 1.4 1.4 1.4.8 0 1.4-.6 1.4-1.4 0-.8-.6-1.4-1.4-1.4z" />
    </svg>
  );
}

export function AparatGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1.5c5.8 0 10.5 4.7 10.5 10.5S17.8 22.5 12 22.5 1.5 17.8 1.5 12 6.2 1.5 12 1.5zm-3.7 4.6a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zm7.6 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zm-4 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zm4.4 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" />
    </svg>
  );
}
