import type { ReactNode } from "react";

import { SiteHeader } from "@/features/site/components/site-header";

export default function RuntimeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="runtime-route-main runtime-dark-preview">{children}</main>
    </div>
  );
}
