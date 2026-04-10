import type { Chain } from "wagmi/chains";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  scrollSepolia,
  sepolia,
} from "wagmi/chains";

export const laisenSupportedChains = [
  baseSepolia,
  scrollSepolia,
  sepolia,
  optimismSepolia,
  arbitrumSepolia,
] as const satisfies readonly [Chain, ...Chain[]];

const supportedChainsById = new Map<number, Chain>(laisenSupportedChains.map((chain) => [chain.id, chain]));
const DEFAULT_LAISEN_TESTNET = baseSepolia;

function resolveTargetChain(): Chain {
  const configuredChainId = Number.parseInt(process.env.NEXT_PUBLIC_LAISEN_CHAIN_ID ?? "", 10);

  if (!Number.isNaN(configuredChainId)) {
    const matchedChain = supportedChainsById.get(configuredChainId);
    if (matchedChain) return matchedChain;
  }

  // Base Sepolia is the canonical testnet path for the runtime. Unsupported or
  // missing configuration should still converge on that default.
  return DEFAULT_LAISEN_TESTNET;
}

export const laisenTestnet = resolveTargetChain();
export const LAISEN_TESTNET_ID = laisenTestnet.id;
export const LAISEN_TESTNET_NAME = laisenTestnet.name;
export const LAISEN_TESTNET_EXPLORER = laisenTestnet.blockExplorers?.default.url ?? "";
