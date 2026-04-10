import type { Metadata } from "next";

import { RuntimeWalletNetworkStage } from "@/features/onchain/components/runtime-wallet-network-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime wallet and network module page.",
};

export default function RuntimePage() {
  return <RuntimeWalletNetworkStage />;
}
