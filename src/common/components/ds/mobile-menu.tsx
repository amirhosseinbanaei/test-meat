"use client";

import * as React from "react";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { cn } from "@/common/lib/cn";
import { Logo } from "./logo";
import { PhoneBlock } from "./phone-block";
import {
  AparatGlyph,
  InstagramGlyph,
  TelegramGlyph,
  YoutubeGlyph,
} from "./brand-icons";

/**
 * Mobile / tablet navigation drawer.
 *
 *   • Hamburger trigger button — visible on screens below `lg` (the breakpoint
 *     where the desktop in-line nav appears in `<SiteHeader/>`).
 *   • Slides in from the start-side (RTL: right edge). Backdrop + ESC + click-
 *     outside dismiss handled here.
 *   • Body-scroll lock while open.
 *
 * The drawer is intentionally self-contained so the surrounding header can
 * stay a Server Component — only this subtree needs `'use client'`.
 */
export type MobileNavLink = { label: string; href: string };

export function MobileMenu({
  links,
  phone,
  cartCount,
}: {
  links: MobileNavLink[];
  phone: string;
  cartCount: string;
}) {
  const [open, setOpen] = React.useState(false);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  // ESC to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن منو"
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        className={cn(
          "lg:hidden inline-flex size-11 items-center justify-center rounded-[10px]",
          "bg-brand-bg text-brand-ink hover:bg-brand-bg/80",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
          "transition-colors",
        )}
      >
        <Menu className="size-5" strokeWidth={2.4} />
      </button>

      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-brand-ink/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* drawer panel */}
      <aside
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="منوی اصلی"
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[88%] max-w-[360px] bg-white shadow-2xl lg:hidden",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          "rounded-l-[28px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* drawer header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <Logo />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full",
              "text-brand-ink hover:bg-brand-bg",
              "outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
              "transition-colors",
            )}
          >
            <X className="size-5" strokeWidth={2.4} />
          </button>
        </div>

        {/* nav links */}
        <nav className="mt-6 flex-1 overflow-y-auto px-5">
          <ul className="flex flex-col gap-1.5">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-right text-base font-medium text-brand-ink",
                    "hover:bg-brand-bg hover:text-brand-red",
                    "transition-colors",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="#"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-center gap-2",
                "rounded-[12px] border border-brand-line bg-white",
                "px-4 py-3 text-sm font-medium text-brand-ink",
                "hover:border-brand-red hover:text-brand-red transition-colors",
              )}
            >
              <User className="size-5 text-brand-red" strokeWidth={2} />
              حساب کاربری
            </a>
            <a
              href="#"
              onClick={() => setOpen(false)}
              className={cn(
                "relative flex items-center justify-center gap-2",
                "rounded-[12px] bg-brand-red text-white",
                "px-4 py-3 text-sm font-medium",
                "hover:bg-brand-red/90 transition-colors",
              )}
            >
              <ShoppingCart className="size-5" strokeWidth={2} />
              سبد خرید
              <span
                aria-label={`${cartCount} مورد`}
                className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-red"
              >
                {cartCount}
              </span>
            </a>
          </div>
        </nav>

        {/* drawer footer: contact + social */}
        <div className="border-t border-brand-line/60 px-5 py-5">
          <PhoneBlock phone={phone} />
          <div className="mt-4 flex items-center justify-end gap-3 text-brand-red">
            <span className="text-sm text-brand-ink">ما را دنبال کنید</span>
            <a href="#" aria-label="تلگرام" className="hover:opacity-80">
              <TelegramGlyph className="size-5" />
            </a>
            <a href="#" aria-label="یوتیوب" className="hover:opacity-80">
              <YoutubeGlyph className="size-5" />
            </a>
            <a href="#" aria-label="اینستاگرام" className="hover:opacity-80">
              <InstagramGlyph className="size-5" />
            </a>
            <a href="#" aria-label="آپارات" className="hover:opacity-80">
              <AparatGlyph className="size-5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
