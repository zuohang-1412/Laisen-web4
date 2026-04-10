import type { Metadata } from "next";

import { runtimeCopy } from "@/features/runtime-site/content/runtime-copy";
import { RuntimePageClient } from "@/features/runtime-site/components/runtime-page-client";

export const metadata: Metadata = {
  title: runtimeCopy.title,
  description: runtimeCopy.description,
};

export default function RuntimePage() {
  return <RuntimePageClient />;
}
