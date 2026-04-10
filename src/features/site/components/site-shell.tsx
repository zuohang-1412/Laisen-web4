import type { PropsWithChildren, ReactNode } from "react";

import { SiteFooter } from "@/features/site/components/site-footer";
import { SiteHeader } from "@/features/site/components/site-header";
import { cn } from "@/lib/utils";

export function SiteShell({
  children,
  headerSlot,
  showFooter = true,
  mainClassName,
}: PropsWithChildren<{
  headerSlot?: ReactNode;
  showFooter?: boolean;
  mainClassName?: string;
}>) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      {headerSlot}
      <main className={cn(mainClassName)}>{children}</main>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
