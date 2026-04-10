import type { PropsWithChildren, ReactNode } from "react";

import { SiteFooter } from "@/features/site/components/site-footer";
import { SiteHeader } from "@/features/site/components/site-header";

export function SiteShell({
  children,
  headerSlot,
}: PropsWithChildren<{
  headerSlot?: ReactNode;
}>) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      {headerSlot}
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
