import Link from "next/link";

import { siteCopy } from "@/features/site/content/site-copy";

export function SiteFooter() {
  return (
    <footer className="site-divider mt-28">
      <div className="site-section py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--site-text)]">{siteCopy.footer.title}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--site-text-secondary)]">
              {siteCopy.footer.body}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm">
            <Link href="/how-it-works" className="site-link">
              {siteCopy.nav.howItWorks}
            </Link>
            <Link href="/evidence" className="site-link">
              {siteCopy.nav.evidence}
            </Link>
            <Link href="/runtime" className="site-link">
              {siteCopy.nav.runtime}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
