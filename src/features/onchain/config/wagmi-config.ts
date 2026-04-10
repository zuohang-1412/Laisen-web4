import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";

import { laisenTestnet } from "@/features/onchain/config/chains";

export const wagmiConfig = createConfig({
  chains: [laisenTestnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Laisen" }),
  ],
  multiInjectedProviderDiscovery: true,
  transports: {
    [laisenTestnet.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
