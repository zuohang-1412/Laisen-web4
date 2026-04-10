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
    <header className="site-header-shell sticky top-0 z-50">
      <div className="site-section">
        <div className="flex h-20 items-center justify-between gap-8">
          <Link href="/" className="site-wordmark" aria-label="Laisen home">
            <span>LAISEN</span>
          </Link>

          <nav aria-label="Primary" className="site-nav-pill hidden items-center gap-1.5 p-1.5 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "site-nav-link inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition",
                    isActive && "site-nav-link-active",
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
