"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { formatEther, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
  type Connector,
} from "wagmi";

import {
  LAISEN_TESTNET_EXPLORER,
  LAISEN_TESTNET_ID,
  LAISEN_TESTNET_NAME,
  laisenTestnet,
} from "@/features/onchain/config/chains";
import {
  createEmptyDeploymentProof,
  createEmptyMandateProof,
  type DeploymentProof,
  type MandateProof,
  type ProtocolPackage,
  type WalletStatus,
} from "@/features/onchain/schema/onchain-schema";
import {
  approveAndExecuteMandate,
  deployProtocolPackage,
  executeMandateProposal,
  readGovernorHasVoted,
  queueMandateProposal,
  readGovernorProposalEta,
  readGovernorProposalSnapshot,
  readGovernorProposalState,
  readGovernorProposalVotes,
  readGovernorQuorumAtSnapshot,
  rejectMandate,
  readTokenVotes,
  voteMandateProposal,
} from "@/features/onchain/services/runtime-protocol-service";
import {
  clearRuntimeOnchainSnapshot,
  createEmptyGovernanceHint,
  loadRuntimeOnchainSnapshot,
  saveRuntimeOnchainSnapshot,
  type GovernanceHint,
  type ProposalHistoryItem,
} from "@/features/onchain/utils/proof-persistence";
import type { RuntimeContext } from "@/features/runtime/schema/runtime-schema";

export function useRuntimeOnchain() {
  const { address, chainId, isConnected, connector: activeConnector } = useAccount();
  const { connectAsync, isPending: isConnecting } = useConnect();
  // useConnectors returns ALL registered connectors (including EIP-6963 discovered ones)
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingNetwork } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: LAISEN_TESTNET_ID });

  const [deployment, setDeployment] = useState<DeploymentProof>(createEmptyDeploymentProof());
  const [mandateProof, setMandateProof] = useState<MandateProof>(createEmptyMandateProof());
  const [walletBalanceWei, setWalletBalanceWei] = useState<bigint | null>(null);
  const [proposalHistory, setProposalHistory] = useState<ProposalHistoryItem[]>([]);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [governanceHint, setGovernanceHint] = useState<GovernanceHint>(createEmptyGovernanceHint());
  const [snapshotHydrated, setSnapshotHydrated] = useState(false);
  const deployInFlightRef = useRef<Promise<DeploymentProof | null> | null>(null);

  function upsertProposalHistory(entry: {
    proposalId: bigint | null;
    action: "approve" | "reject" | "unknown";
    governorState: number | null;
    proposalEta?: bigint | null;
    forVotes?: bigint | null;
    againstVotes?: bigint | null;
    abstainVotes?: bigint | null;
    quorumRequired?: bigint | null;
    proposalTxHash: string | null;
    proposalBlockNumber?: number | null;
    voteTxHash: string | null;
    voteBlockNumber?: number | null;
    queueTxHash: string | null;
    queueBlockNumber?: number | null;
    executeTxHash: string | null;
    executeBlockNumber?: number | null;
  }) {
    if (!entry.proposalId) return;
    const proposalId = entry.proposalId;

    setProposalHistory((current) => {
      const now = Date.now();
      const index = current.findIndex((item) => item.proposalId === proposalId);

      if (index === -1) {
        return [
          {
            proposalId,
            action: entry.action,
            governorState: entry.governorState,
            proposalEta: entry.proposalEta ?? null,
            forVotes: entry.forVotes ?? null,
            againstVotes: entry.againstVotes ?? null,
            abstainVotes: entry.abstainVotes ?? null,
            quorumRequired: entry.quorumRequired ?? null,
            proposalTxHash: entry.proposalTxHash,
            proposalBlockNumber: entry.proposalBlockNumber ?? null,
            voteTxHash: entry.voteTxHash,
            voteBlockNumber: entry.voteBlockNumber ?? null,
            queueTxHash: entry.queueTxHash,
            queueBlockNumber: entry.queueBlockNumber ?? null,
            executeTxHash: entry.executeTxHash,
            executeBlockNumber: entry.executeBlockNumber ?? null,
            updatedAt: now,
          },
          ...current,
        ].slice(0, 12);
      }

      const next = [...current];
      next[index] = {
        ...next[index],
        action: entry.action,
        governorState: entry.governorState ?? next[index].governorState,
        proposalEta: entry.proposalEta ?? next[index].proposalEta,
        forVotes: entry.forVotes ?? next[index].forVotes,
        againstVotes: entry.againstVotes ?? next[index].againstVotes,
        abstainVotes: entry.abstainVotes ?? next[index].abstainVotes,
        quorumRequired: entry.quorumRequired ?? next[index].quorumRequired,
        proposalTxHash: entry.proposalTxHash ?? next[index].proposalTxHash,
        proposalBlockNumber: entry.proposalBlockNumber ?? next[index].proposalBlockNumber,
        voteTxHash: entry.voteTxHash ?? next[index].voteTxHash,
        voteBlockNumber: entry.voteBlockNumber ?? next[index].voteBlockNumber,
        queueTxHash: entry.queueTxHash ?? next[index].queueTxHash,
        queueBlockNumber: entry.queueBlockNumber ?? next[index].queueBlockNumber,
        executeTxHash: entry.executeTxHash ?? next[index].executeTxHash,
        executeBlockNumber: entry.executeBlockNumber ?? next[index].executeBlockNumber,
        updatedAt: now,
      };
      return next.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12);
    });
  }
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hasGasBalance = walletBalanceWei === null ? true : walletBalanceWei > BigInt(0);
  const walletStatus = useMemo<WalletStatus>(() => {
    // Keep first client render aligned with SSR output to avoid hydration mismatch.
    if (!isHydrated) return "disconnected";
    if (isConnecting) return "connecting";
    if (walletError) return "failed";
    if (!isConnected || !address) return "disconnected";
    if (isSwitchingNetwork) return "switching_network";
    if (chainId !== LAISEN_TESTNET_ID) return "wrong_network";
    if (!hasGasBalance) return "no_test_eth";
    return "ready";
  }, [address, chainId, isConnected, isConnecting, isSwitchingNetwork, walletError, isHydrated, hasGasBalance]);

  const walletAddress = isHydrated ? address ?? null : null;
  const activeChainId = isHydrated ? chainId ?? null : null;
  const activeChainName =
    activeChainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : "Unsupported network";
  const daoAutomation = (process.env.NEXT_PUBLIC_LAISEN_DAO_AUTOMATION ?? "true").toLowerCase() !== "false";

  useEffect(() => {
    const snapshot = loadRuntimeOnchainSnapshot(typeof window === "undefined" ? undefined : window.localStorage);
    if (snapshot) {
      setDeployment(snapshot.deployment);
      setMandateProof(snapshot.mandateProof);
      setGovernanceHint(snapshot.governanceHint);
      setProposalHistory(snapshot.proposalHistory);
    }
    setSnapshotHydrated(true);
  }, []);

  useEffect(() => {
    if (!snapshotHydrated) return;
    saveRuntimeOnchainSnapshot(typeof window === "undefined" ? undefined : window.localStorage, {
      deployment,
      mandateProof,
      governanceHint,
      proposalHistory,
    });
  }, [deployment, governanceHint, mandateProof, proposalHistory, snapshotHydrated]);

  useEffect(() => {
    if (!publicClient || !address || chainId !== LAISEN_TESTNET_ID) {
      setWalletBalanceWei(null);
      return;
    }

    let cancelled = false;
    const syncBalance = async () => {
      try {
        const balance = await publicClient.getBalance({ address: address as Address });
        if (!cancelled) setWalletBalanceWei(balance);
      } catch {
        if (!cancelled) setWalletBalanceWei(null);
      }
    };

    void syncBalance();
    const timer = setInterval(() => {
      void syncBalance();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [publicClient, address, chainId]);

  // EIP-6963 discovered connectors have rdns matching known wallets.
  // Prefer MetaMask (by rdns or name), then any injected, then first available.
  const preferredConnector = useMemo(() => {
    return (
      connectors.find(
        (c) =>
          (typeof c.rdns === "string" && (c.rdns === "io.metamask" || c.rdns.includes("metamask"))) ||
          (Array.isArray(c.rdns) && (c.rdns as string[]).some((r) => r.includes("metamask"))) ||
          c.id.toLowerCase().includes("metamask") ||
          c.name.toLowerCase().includes("metamask"),
      ) ??
      connectors.find((c) => c.id === "injected") ??
      connectors[0]
    );
  }, [connectors]);

  async function connectWallet(connector?: Connector) {
    setWalletError(null);

    const target = connector ?? preferredConnector;

    if (!target) {
      setWalletError(
        "No wallet connector found. Make sure MetaMask is installed and the page is fully loaded.",
      );
      return;
    }

    try {
      await connectAsync({ connector: target });
      setWalletError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Wallet connection failed. Make sure the wallet is installed and unlocked.";
      setWalletError(message);
    }
  }

  function disconnectWallet() {
    setWalletError(null);
    disconnect();
  }

  async function switchToBaseSepolia() {
    setWalletError(null);

    try {
      await switchChainAsync({ chainId: LAISEN_TESTNET_ID });
      return;
    } catch {
      // Fall through to direct provider calls for wallets that ignore wagmi switch flow.
    }

    const ethereum =
      typeof window !== "undefined"
        ? (window as Window & {
            ethereum?: {
              request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            };
          }).ethereum
        : undefined;

    if (!ethereum) {
      setWalletError("Wallet provider not found for network switch.");
      return;
    }

    const chainIdHex = `0x${LAISEN_TESTNET_ID.toString(16)}`;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      return;
    } catch (switchError) {
      const maybeCode =
        typeof switchError === "object" && switchError && "code" in switchError
          ? Number((switchError as { code?: unknown }).code)
          : undefined;

      if (maybeCode !== 4902) {
        const message =
          switchError instanceof Error ? switchError.message : "Network switch request was rejected.";
        setWalletError(message);
        return;
      }
    }

    try {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: LAISEN_TESTNET_NAME,
            nativeCurrency: laisenTestnet.nativeCurrency,
            rpcUrls: laisenTestnet.rpcUrls.default.http,
            blockExplorerUrls: [LAISEN_TESTNET_EXPLORER],
          },
        ],
      });

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unable to add or switch to ${LAISEN_TESTNET_NAME}.`;
      setWalletError(message);
    }
  }

  async function deploy(protocolPackage: ProtocolPackage) {
    if (deployInFlightRef.current) {
      return deployInFlightRef.current;
    }

    const deploymentTask = (async () => {
    setWalletError(null);

    if (!isConnected || !address) {
      setDeployment({
        ...createEmptyDeploymentProof(),
        status: "failed",
        walletAddress: address ?? null,
        chainId: chainId ?? null,
        chainName: chainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : "Wrong network",
        error: "Connect wallet first.",
        usedFallback: false,
      });
      return null;
    }

    if (chainId !== LAISEN_TESTNET_ID) {
      await switchToBaseSepolia();
      setDeployment((current) => ({
        ...current,
        status: "failed",
        walletAddress: address,
        chainId: chainId ?? null,
        chainName: chainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : "Wrong network",
        error: "Switch requested. Confirm in wallet, then deploy again.",
        usedFallback: false,
      }));
      return null;
    }

    if (!walletClient || !publicClient || !address) {
      setDeployment({
        ...createEmptyDeploymentProof(),
        status: "failed",
        walletAddress: address ?? null,
        chainId: chainId ?? null,
        chainName: chainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : "Wrong network",
        error: "Wallet or public client not ready.",
        usedFallback: false,
      });
      return null;
    }

    setDeployment((current) => ({
      ...current,
      status: "deploying",
      walletAddress: address,
      chainId: chainId ?? LAISEN_TESTNET_ID,
      chainName: LAISEN_TESTNET_NAME,
      txProgressCurrent: 0,
      txProgressTotal: 0,
      txProgressLabel: "Preparing deployment transactions",
      error: null,
      usedFallback: false,
    }));

    try {
      const proof = await deployProtocolPackage({
        walletClient,
        publicClient,
        account: address as Address,
        protocolPackage,
        onProgress: (progress) => {
          setDeployment((current) => ({
            ...current,
            status: "deploying",
            walletAddress: address,
            chainId: chainId ?? LAISEN_TESTNET_ID,
            chainName: LAISEN_TESTNET_NAME,
            txProgressCurrent: progress.current,
            txProgressTotal: progress.total,
            txProgressLabel: progress.label,
            error: null,
            usedFallback: false,
          }));
        },
      });
      setWalletError(null);
      setDeployment(proof);
      return proof;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Deployment failed.";
      setDeployment((current) => ({
        ...current,
        status: "failed",
        walletAddress: address,
        chainId: chainId ?? LAISEN_TESTNET_ID,
        chainName: LAISEN_TESTNET_NAME,
        error: message,
        usedFallback: false,
      }));
      return null;
    }
    })();

    deployInFlightRef.current = deploymentTask;
    try {
      return await deploymentTask;
    } finally {
      if (deployInFlightRef.current === deploymentTask) {
        deployInFlightRef.current = null;
      }
    }
  }

  function armFallback(reason: string) {
    setDeployment((current) => ({
      ...current,
      status: "fallback_ready",
      walletAddress: address ?? current.walletAddress,
      chainId: chainId ?? current.chainId,
      chainName: chainId === LAISEN_TESTNET_ID ? LAISEN_TESTNET_NAME : current.chainName,
      error: reason,
      usedFallback: true,
    }));
  }

  async function approveAndExecute(
    runtimeContext: RuntimeContext,
    protocolPackage: ProtocolPackage,
  ) {
    if (!walletClient || !publicClient || !address || !deployment.protocolAddress || !deployment.governorAddress) {
      setMandateProof({
        ...createEmptyMandateProof(),
        status: "failed",
        error: "Wallet, chain, governor, or protocol deployment is missing.",
      });
      return null;
    }

    setMandateProof((current) => ({ ...current, status: "awaiting_wallet", error: null }));

    try {
      setMandateProof((current) => ({ ...current, status: "signing", error: null }));
      const proof = await approveAndExecuteMandate({
        walletClient,
        publicClient,
        account: address as Address,
        governorAddress: deployment.governorAddress as Address,
        protocolAddress: deployment.protocolAddress as Address,
        runtimeContext,
        protocolPackage,
        onProgress: (patch) => {
          setMandateProof((current) => ({ ...current, ...patch }));
          upsertProposalHistory({
            proposalId: patch.proposalId ?? null,
            action: "approve",
            governorState: patch.governorState ?? null,
            proposalTxHash: patch.proposalTxHash ?? null,
            proposalBlockNumber: patch.proposalBlockNumber ?? null,
            voteTxHash: patch.voteTxHash ?? null,
            voteBlockNumber: patch.voteBlockNumber ?? null,
            queueTxHash: patch.queueTxHash ?? null,
            queueBlockNumber: patch.queueBlockNumber ?? null,
            executeTxHash: patch.actionTxHash ?? null,
            executeBlockNumber: patch.actionBlockNumber ?? null,
          });
        },
      });
      setMandateProof(proof);
      upsertProposalHistory({
        proposalId: proof.proposalId,
        action: proof.proposalAction ?? "approve",
        governorState: proof.governorState,
        proposalTxHash: proof.proposalTxHash,
        proposalBlockNumber: proof.proposalBlockNumber,
        voteTxHash: proof.voteTxHash,
        voteBlockNumber: proof.voteBlockNumber,
        queueTxHash: proof.queueTxHash,
        queueBlockNumber: proof.queueBlockNumber,
        executeTxHash: proof.actionTxHash,
        executeBlockNumber: proof.actionBlockNumber,
      });
      return proof;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approve and execute failed.";
      setMandateProof((current) => ({ ...current, status: "failed", error: message }));
      return null;
    }
  }

  async function reject(runtimeContext: RuntimeContext, protocolPackage: ProtocolPackage) {
    if (!walletClient || !publicClient || !address || !deployment.protocolAddress || !deployment.governorAddress) {
      setMandateProof({
        ...createEmptyMandateProof(),
        status: "failed",
        error: "Wallet, chain, governor, or protocol deployment is missing.",
      });
      return null;
    }

    setMandateProof((current) => ({ ...current, status: "awaiting_wallet", error: null }));

    try {
      setMandateProof((current) => ({ ...current, status: "signing", error: null }));
      const proof = await rejectMandate({
        walletClient,
        publicClient,
        account: address as Address,
        governorAddress: deployment.governorAddress as Address,
        protocolAddress: deployment.protocolAddress as Address,
        runtimeContext,
        protocolPackage,
        onProgress: (patch) => {
          setMandateProof((current) => ({ ...current, ...patch }));
          upsertProposalHistory({
            proposalId: patch.proposalId ?? null,
            action: "reject",
            governorState: patch.governorState ?? null,
            proposalTxHash: patch.proposalTxHash ?? null,
            proposalBlockNumber: patch.proposalBlockNumber ?? null,
            voteTxHash: patch.voteTxHash ?? null,
            voteBlockNumber: patch.voteBlockNumber ?? null,
            queueTxHash: patch.queueTxHash ?? null,
            queueBlockNumber: patch.queueBlockNumber ?? null,
            executeTxHash: patch.actionTxHash ?? null,
            executeBlockNumber: patch.actionBlockNumber ?? null,
          });
        },
      });
      setMandateProof(proof);
      upsertProposalHistory({
        proposalId: proof.proposalId,
        action: proof.proposalAction ?? "reject",
        governorState: proof.governorState,
        proposalTxHash: proof.proposalTxHash,
        proposalBlockNumber: proof.proposalBlockNumber,
        voteTxHash: proof.voteTxHash,
        voteBlockNumber: proof.voteBlockNumber,
        queueTxHash: proof.queueTxHash,
        queueBlockNumber: proof.queueBlockNumber,
        executeTxHash: proof.actionTxHash,
        executeBlockNumber: proof.actionBlockNumber,
      });
      return proof;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reject mandate failed.";
      setMandateProof((current) => ({ ...current, status: "failed", error: message }));
      return null;
    }
  }

  async function voteProposal() {
    if (!walletClient || !publicClient || !address || !deployment.governorAddress || !mandateProof.proposalId) {
      setMandateProof((current) => ({ ...current, status: "failed", error: "Proposal or governor is missing." }));
      return null;
    }

    setMandateProof((current) => ({ ...current, status: "signing", error: null }));
    try {
      const voteResult = await voteMandateProposal({
        walletClient,
        publicClient,
        account: address as Address,
        governorAddress: deployment.governorAddress as Address,
        proposalId: mandateProof.proposalId,
      });
      setMandateProof((current) => ({
        ...current,
        voteTxHash: voteResult.txHash,
        voteBlockNumber: voteResult.blockNumber,
        events: [...current.events, ...voteResult.events],
        governorState: 1,
        status: "awaiting_wallet",
        error: null,
      }));
      upsertProposalHistory({
        proposalId: mandateProof.proposalId,
        action: mandateProof.proposalAction ?? "unknown",
        governorState: 1,
        proposalTxHash: mandateProof.proposalTxHash,
        proposalBlockNumber: mandateProof.proposalBlockNumber,
        voteTxHash: voteResult.txHash,
        voteBlockNumber: voteResult.blockNumber,
        queueTxHash: mandateProof.queueTxHash,
        queueBlockNumber: mandateProof.queueBlockNumber,
        executeTxHash: mandateProof.actionTxHash,
        executeBlockNumber: mandateProof.actionBlockNumber,
      });
      return voteResult.txHash;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vote failed.";
      setMandateProof((current) => ({ ...current, status: "failed", error: message }));
      return null;
    }
  }

  async function queueProposal(runtimeContext: RuntimeContext, protocolPackage: ProtocolPackage) {
    if (
      !walletClient ||
      !publicClient ||
      !address ||
      !deployment.governorAddress ||
      !deployment.protocolAddress ||
      !mandateProof.proposalId ||
      !mandateProof.proposalAction
    ) {
      setMandateProof((current) => ({ ...current, status: "failed", error: "Queue prerequisites are missing." }));
      return null;
    }

    setMandateProof((current) => ({ ...current, status: "signing", error: null }));
    try {
      const queueResult = await queueMandateProposal({
        walletClient,
        publicClient,
        account: address as Address,
        governorAddress: deployment.governorAddress as Address,
        protocolAddress: deployment.protocolAddress as Address,
        runtimeContext,
        protocolPackage,
        proposalAction: mandateProof.proposalAction,
        proposalId: mandateProof.proposalId,
      });
      setMandateProof((current) => ({
        ...current,
        queueTxHash: queueResult.txHash,
        queueBlockNumber: queueResult.blockNumber,
        events: [...current.events, ...queueResult.events],
        governorState: 5,
        status: "awaiting_wallet",
        error: null,
      }));
      upsertProposalHistory({
        proposalId: mandateProof.proposalId,
        action: mandateProof.proposalAction ?? "unknown",
        governorState: 5,
        proposalTxHash: mandateProof.proposalTxHash,
        proposalBlockNumber: mandateProof.proposalBlockNumber,
        voteTxHash: mandateProof.voteTxHash,
        voteBlockNumber: mandateProof.voteBlockNumber,
        queueTxHash: queueResult.txHash,
        queueBlockNumber: queueResult.blockNumber,
        executeTxHash: mandateProof.actionTxHash,
        executeBlockNumber: mandateProof.actionBlockNumber,
      });
      return queueResult.txHash;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Queue failed.";
      setMandateProof((current) => ({ ...current, status: "failed", error: message }));
      return null;
    }
  }

  async function executeProposal(runtimeContext: RuntimeContext, protocolPackage: ProtocolPackage) {
    if (
      !walletClient ||
      !publicClient ||
      !address ||
      !deployment.governorAddress ||
      !deployment.protocolAddress ||
      !mandateProof.proposalId ||
      !mandateProof.proposalAction
    ) {
      setMandateProof((current) => ({ ...current, status: "failed", error: "Execute prerequisites are missing." }));
      return null;
    }

    setMandateProof((current) => ({ ...current, status: "signing", error: null }));
    try {
      const result = await executeMandateProposal({
        walletClient,
        publicClient,
        account: address as Address,
        governorAddress: deployment.governorAddress as Address,
        protocolAddress: deployment.protocolAddress as Address,
        runtimeContext,
        protocolPackage,
        proposalAction: mandateProof.proposalAction,
        proposalId: mandateProof.proposalId,
      });

      const finalStatus = mandateProof.proposalAction === "approve" ? "executed" : "rejected";
      setMandateProof((current) => ({
        ...current,
        status: finalStatus,
        governorState: 7,
        actionTxHash: result.executeTxHash,
        actionBlockNumber: result.executeBlockNumber,
        mandateId: current.mandateId ?? result.hashes.mandateId,
        executionHash: finalStatus === "executed" ? result.hashes.executionHash : null,
        rejectionHash: finalStatus === "rejected" ? result.hashes.rejectionHash : null,
        events: [...current.events, ...result.events],
        blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${result.executeTxHash}`,
        error: null,
      }));
      upsertProposalHistory({
        proposalId: mandateProof.proposalId,
        action: mandateProof.proposalAction ?? "unknown",
        governorState: 7,
        proposalTxHash: mandateProof.proposalTxHash,
        proposalBlockNumber: mandateProof.proposalBlockNumber,
        voteTxHash: mandateProof.voteTxHash,
        voteBlockNumber: mandateProof.voteBlockNumber,
        queueTxHash: mandateProof.queueTxHash,
        queueBlockNumber: mandateProof.queueBlockNumber,
        executeTxHash: result.executeTxHash,
        executeBlockNumber: result.executeBlockNumber,
      });
      return result.executeTxHash;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execute failed.";
      setMandateProof((current) => ({ ...current, status: "failed", error: message }));
      return null;
    }
  }

  async function refreshProposalState() {
    if (!publicClient || !deployment.governorAddress || !mandateProof.proposalId) return null;
    try {
      const governorAddress = deployment.governorAddress as Address;
      const proposalId = mandateProof.proposalId;
      const [state, eta] = await Promise.all([
        readGovernorProposalState({
          publicClient,
          governorAddress,
          proposalId,
        }),
        readGovernorProposalEta({
          publicClient,
          governorAddress,
          proposalId,
        }),
      ]);

      setMandateProof((current) => ({
        ...current,
        governorState: state,
        proposalEta: eta,
      }));

      return state;
    } catch {
      return null;
    }
  }

  function selectProposalFromHistory(proposalId: bigint) {
    const target = proposalHistory.find((item) => item.proposalId === proposalId);
    if (!target) return;

    setMandateProof((current) => ({
      ...current,
      proposalId: target.proposalId,
      proposalAction: target.action === "unknown" ? current.proposalAction : target.action,
      governorState: target.governorState,
      proposalEta: target.proposalEta,
      proposalTxHash: target.proposalTxHash,
      proposalBlockNumber: target.proposalBlockNumber,
      voteTxHash: target.voteTxHash,
      voteBlockNumber: target.voteBlockNumber,
      queueTxHash: target.queueTxHash,
      queueBlockNumber: target.queueBlockNumber,
      actionTxHash: target.executeTxHash,
      actionBlockNumber: target.executeBlockNumber,
      status:
        target.governorState === 7
          ? target.action === "reject"
            ? "rejected"
            : "executed"
          : current.status,
    }));
  }

  useEffect(() => {
    if (!publicClient || !deployment.governorAddress || !mandateProof.proposalId) return;

    let cancelled = false;
    const governorAddress = deployment.governorAddress as Address;
    const proposalId = mandateProof.proposalId;

    const syncProposalMeta = async () => {
      try {
        const [governorState, proposalEta] = await Promise.all([
          readGovernorProposalState({
            publicClient,
            governorAddress,
            proposalId,
          }),
          readGovernorProposalEta({
            publicClient,
            governorAddress,
            proposalId,
          }),
        ]);

        if (cancelled) return;
        setMandateProof((current) => {
          if (current.proposalId !== proposalId) return current;
          return {
            ...current,
            governorState,
            proposalEta,
          };
        });
        upsertProposalHistory({
          proposalId,
          action: mandateProof.proposalAction ?? "unknown",
          governorState,
          proposalTxHash: mandateProof.proposalTxHash,
          proposalBlockNumber: mandateProof.proposalBlockNumber,
          voteTxHash: mandateProof.voteTxHash,
          voteBlockNumber: mandateProof.voteBlockNumber,
          queueTxHash: mandateProof.queueTxHash,
          queueBlockNumber: mandateProof.queueBlockNumber,
          executeTxHash: mandateProof.actionTxHash,
          executeBlockNumber: mandateProof.actionBlockNumber,
        });

        if (address && deployment.tokenAddress) {
          const [snapshot, votes, hasVoted, tokenVotes] = await Promise.all([
            readGovernorProposalSnapshot({
              publicClient,
              governorAddress,
              proposalId,
            }),
            readGovernorProposalVotes({
              publicClient,
              governorAddress,
              proposalId,
            }),
            readGovernorHasVoted({
              publicClient,
              governorAddress,
              proposalId,
              account: address as Address,
            }),
            readTokenVotes({
              publicClient,
              tokenAddress: deployment.tokenAddress as Address,
              account: address as Address,
            }),
          ]);

          const quorumRequired = await readGovernorQuorumAtSnapshot({
            publicClient,
            governorAddress,
            snapshot,
          });
          const remainingForVotes = quorumRequired > votes.support ? quorumRequired - votes.support : BigInt(0);

          if (cancelled) return;
          setGovernanceHint({
            hasVoted,
            walletVotes: tokenVotes,
            quorumRequired,
            forVotes: votes.support,
            remainingForVotes,
          });
          upsertProposalHistory({
            proposalId,
            action: mandateProof.proposalAction ?? "unknown",
            governorState,
            proposalEta,
            forVotes: votes.support,
            againstVotes: votes.against,
            abstainVotes: votes.abstain,
            quorumRequired,
            proposalTxHash: mandateProof.proposalTxHash,
            proposalBlockNumber: mandateProof.proposalBlockNumber,
            voteTxHash: mandateProof.voteTxHash,
            voteBlockNumber: mandateProof.voteBlockNumber,
            queueTxHash: mandateProof.queueTxHash,
            queueBlockNumber: mandateProof.queueBlockNumber,
            executeTxHash: mandateProof.actionTxHash,
            executeBlockNumber: mandateProof.actionBlockNumber,
          });
        } else {
          setGovernanceHint(createEmptyGovernanceHint());
        }
      } catch {
        // Ignore temporary RPC errors and retry on next tick.
      }
    };

    void syncProposalMeta();
    const timer = setInterval(() => {
      void syncProposalMeta();
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [
    publicClient,
    deployment.governorAddress,
    deployment.tokenAddress,
    mandateProof.proposalId,
    mandateProof.proposalAction,
    mandateProof.proposalTxHash,
    mandateProof.proposalBlockNumber,
    mandateProof.voteTxHash,
    mandateProof.voteBlockNumber,
    mandateProof.queueTxHash,
    mandateProof.queueBlockNumber,
    mandateProof.actionTxHash,
    mandateProof.actionBlockNumber,
    address,
  ]);

  return {
    walletStatus,
    walletAddress,
    walletError,
    connectors,
    activeConnector: isHydrated ? activeConnector ?? null : null,
    chainId: activeChainId,
    chainName: activeChainName,
    walletBalanceWei,
    walletBalanceEth: walletBalanceWei === null ? null : formatEther(walletBalanceWei),
    isConnected: isHydrated ? isConnected : false,
    daoAutomation,
    deployment,
    mandateProof,
    governanceHint,
    proposalHistory,
    connectWallet,
    disconnectWallet,
    switchToBaseSepolia,
    deploy,
    armFallback,
    approveAndExecute,
    reject,
    voteProposal,
    queueProposal,
    executeProposal,
    refreshProposalState,
    selectProposalFromHistory,
    resetOnchainState: () => {
      setDeployment(createEmptyDeploymentProof());
      setMandateProof(createEmptyMandateProof());
      setGovernanceHint(createEmptyGovernanceHint());
      setProposalHistory([]);
      clearRuntimeOnchainSnapshot(typeof window === "undefined" ? undefined : window.localStorage);
    },
  };
}
