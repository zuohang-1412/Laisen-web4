import type { Chain } from "wagmi/chains";
import { baseSepolia, sepolia } from "wagmi/chains";

export const laisenSupportedChains = [baseSepolia, sepolia] as const satisfies readonly [Chain, ...Chain[]];

const supportedChainsById = new Map<number, Chain>(laisenSupportedChains.map((chain) => [chain.id, chain]));
const defaultTestnet = baseSepolia;

function resolveTargetChain(): Chain {
  const configuredChainId = Number.parseInt(process.env.NEXT_PUBLIC_LAISEN_CHAIN_ID ?? "", 10);

  if (!Number.isNaN(configuredChainId)) {
    const matchedChain = supportedChainsById.get(configuredChainId);
    if (matchedChain) return matchedChain;
  }

  return defaultTestnet;
}

export const laisenTestnet = resolveTargetChain();
export const LAISEN_TESTNET_ID = laisenTestnet.id;
export const LAISEN_TESTNET_NAME = laisenTestnet.name;
