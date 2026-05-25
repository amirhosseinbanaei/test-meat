import { Fragment } from "react";
import { User } from "lucide-react";
import {
  CartBadge,
  Container,
  Logo,
  MobileMenu,
  NavCtaButton,
  PhoneBlock,
  SearchInput,
} from "@/common/components/ds";
import { navLinks } from "../data/home-content";

const PHONE = "۰۲۱-۶۵۲۵۲۲۳";
const CART_COUNT = "۳";

/**
 * Section 01 — Site header. Two stacked rows:
 *
 *   • Utility row — phone block · brand wordmark · search field.
 *     On mobile the search drops to a third row (full width) so the brand
 *     row stays tidy and reachable.
 *
 *   • Navigation pill — olive "categories" CTA on the start side, primary
 *     nav links in the middle (hidden below `lg`, available through the
 *     mobile drawer instead), and the account / cart cluster on the end
 *     side. The pill has the same asymmetric corner radius (sharp top-end,
 *     rounded everywhere else) as the design.
 *
 * Header itself stays a Server Component; only the `<MobileMenu/>` subtree
 * carries `'use client'`.
 */
export function SiteHeader() {
  return (
    <header className="bg-white">
      <Container className="pt-5 sm:pt-6">
        {/* utility row */}
        <div className="flex flex-wrap items-center pr-7 justify-between gap-x-6">
          <PhoneBlock phone={PHONE} />
          <Logo />
          <SearchInput className="w-full md:w-71.25" />
        </div>

        {/* navigation pill */}
        <nav
          aria-label="Primary"
          className={[
            "mt-4 sm:mt-5",
            "flex items-center justify-between gap-3 sm:gap-4",
            "bg-brand-bg rounded-[20px_0_20px_20px]",
            "px-3 sm:px-5 py-3",
            "min-h-20.5",
          ].join(" ")}
        >
          {/* start side: hamburger (mobile) + nav CTA */}
          <div className="flex items-center gap-3">
            <MobileMenu
              links={navLinks}
              phone={PHONE}
              cartCount={CART_COUNT}
            />
            <NavCtaButton />
          </div>

          {/* primary nav links — visible from `lg` upwards */}
          <ul className="hidden lg:flex items-center gap-5 text-base text-brand-ink">
            {navLinks.map((link, index) => (
              <Fragment key={link.label}>
                <li>
                  <a
                    href={link.href}
                    className="px-1 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
                {index < navLinks.length - 1 && (
                  <li aria-hidden className="h-4.5 w-px bg-brand-line" />
                )}
              </Fragment>
            ))}
          </ul>

          {/* account + cart cluster */}
          <div className="flex items-center gap-3 sm:gap-6 text-base text-brand-red">
            <a
              href="#"
              className="inline-flex items-center gap-2 hover:opacity-80"
            >
              <User className="size-5.5" strokeWidth={2} />
              <span className="hidden sm:inline">حساب کاربری</span>
            </a>
             <span aria-hidden className="h-4.5 w-px bg-brand-line xl:-mx-3" />
            <a
              href="#"
              className="inline-flex items-center gap-2 hover:opacity-80"
            >
              <CartBadge count={CART_COUNT} />
              <span className="hidden sm:inline">سبد خرید</span>
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
}
