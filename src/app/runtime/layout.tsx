import type { ReactNode } from "react";

import { SiteShell } from "@/features/site/components/site-shell";

export default function RuntimeLayout({ children }: { children: ReactNode }) {
  return <SiteShell showFooter={false} mainClassName="runtime-route-main">{children}</SiteShell>;
}
