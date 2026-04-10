"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteCopy } from "@/features/site/content/site-copy";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: siteCopy.nav.overview },
  { href: "/how-it-works", label: siteCopy.nav.howItWorks },
  { href: "/evidence", label: siteCopy.nav.evidence },
  { href: "/runtime", label: siteCopy.nav.runtime },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--site-line)] bg-[rgba(244,246,243,0.84)] backdrop-blur-xl">
      <div className="site-section">
        <div className="flex h-20 items-center justify-between gap-8">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-[var(--site-text)] uppercase">
            Laisen
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition",
                    isActive
                      ? "bg-white/70 text-[var(--site-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                      : "site-link",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link href="/runtime" className="site-primary-cta">
            {siteCopy.nav.primaryCta}
          </Link>
        </div>
      </div>
    </header>
  );
}
