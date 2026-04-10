import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";

import { laisenTestnet } from "@/features/onchain/config/chains";

export const wagmiConfig = createConfig({
  chains: [laisenTestnet],
  connectors: [
    // Generic injected — covers MetaMask extension, Rabby, OKX, Phantom, Brave, etc.
    // With multiInjectedProviderDiscovery: true, wagmi auto-discovers all EIP-6963 wallets.
    injected(),
    // Coinbase Wallet SDK (has its own bundled provider, no extra install needed)
    coinbaseWallet({ appName: "Laisen" }),
  ],
  // Auto-discover all browser-injected wallets via EIP-6963
  multiInjectedProviderDiscovery: true,
  transports: {
    [laisenTestnet.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
