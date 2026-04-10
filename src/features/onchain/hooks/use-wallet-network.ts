"use client";

import { useMemo } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
  type Connector,
} from "wagmi";

import { LAISEN_TESTNET_ID, LAISEN_TESTNET_NAME } from "@/features/onchain/config/chains";

export function useWalletNetwork() {
  const { address, chainId, isConnected, connector } = useAccount();
  const { connectAsync, isPending: isConnecting, error: connectError } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingNetwork, error: switchError } = useSwitchChain();
  const { data: balance } = useBalance({
    address,
    chainId: LAISEN_TESTNET_ID,
    query: {
      refetchInterval: 10000,
    },
  });

  const walletStatus = useMemo(() => {
    if (isConnecting) return "connecting" as const;
    if (!isConnected || !address) return "disconnected" as const;
    if (isSwitchingNetwork) return "switching_network" as const;
    if (chainId !== LAISEN_TESTNET_ID) return "wrong_network" as const;
    if (balance && balance.value === BigInt(0)) return "no_test_eth" as const;
    return "ready" as const;
  }, [address, balance, chainId, isConnected, isConnecting, isSwitchingNetwork]);

  const preferredConnector = useMemo(() => {
    return (
      connectors.find(
        (item) =>
          (typeof item.rdns === "string" && (item.rdns === "io.metamask" || item.rdns.includes("metamask"))) ||
          item.id.toLowerCase().includes("metamask") ||
          item.name.toLowerCase().includes("metamask"),
      ) ??
      connectors.find((item) => item.id === "injected") ??
      connectors[0]
    );
  }, [connectors]);

  async function connectWallet(target?: Connector) {
    const connectorTarget = target ?? preferredConnector;
    if (!connectorTarget) return;
    await connectAsync({ connector: connectorTarget });
  }

  function disconnectWallet() {
    disconnect();
  }

  async function switchToTargetNetwork() {
    await switchChainAsync({ chainId: LAISEN_TESTNET_ID });
  }

  return {
    walletStatus,
    connectors,
    activeConnector: connector ?? null,
    walletAddress: address ?? null,
    chainId: chainId ?? null,
    chainName: chainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : "Unsupported network",
    walletBalanceEth: balance ? formatEther(balance.value) : null,
    connectError: connectError?.message ?? null,
    switchError: switchError?.message ?? null,
    connectWallet,
    disconnectWallet,
    switchToTargetNetwork,
  };
}
