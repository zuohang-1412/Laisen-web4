import type { Address, PublicClient, WalletClient } from "viem";
import { encodeFunctionData, keccak256, stringToBytes } from "viem";

import { governorAbi, protocolAbi } from "@/features/governance/contracts/governance-abi";
import {
  GovernanceTxResultSchema,
  type GovernanceActionPayload,
  type GovernanceTxResult,
} from "@/features/governance/schema/governance-schema";

const SUPPORT_FOR = 1;

export function buildGovernanceProposal(payload: GovernanceActionPayload) {
  const calldata = encodeFunctionData({
    abi: protocolAbi,
    functionName: "approveAndExecuteMandate",
    args: [
      payload.mandateId as `0x${string}`,
      payload.mandateHash as `0x${string}`,
      payload.signalHash as `0x${string}`,
      payload.decisionHash as `0x${string}`,
      payload.executionHash as `0x${string}`,
    ],
  });

  return {
    targets: [payload.protocolAddress as Address],
    values: [BigInt(0)],
    calldatas: [calldata],
    description: payload.description,
    descriptionHash: keccak256(stringToBytes(payload.description)),
  };
}

export async function proposeAction(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  payload: GovernanceActionPayload;
}): Promise<GovernanceTxResult> {
  const { walletClient, publicClient, account, payload } = params;
  const proposal = buildGovernanceProposal(payload);

  const txHash = await walletClient.writeContract({
    account,
    chain: walletClient.chain,
    address: payload.governorAddress as Address,
    abi: governorAbi,
    functionName: "propose",
    args: [proposal.targets, proposal.values, proposal.calldatas, proposal.description],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  return GovernanceTxResultSchema.parse({
    txHash,
    blockNumber: Number(receipt.blockNumber),
  });
}

export async function voteForAction(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  proposalId: bigint;
}): Promise<GovernanceTxResult> {
  const txHash = await params.walletClient.writeContract({
    account: params.account,
    chain: params.walletClient.chain,
    address: params.governorAddress,
    abi: governorAbi,
    functionName: "castVote",
    args: [params.proposalId, SUPPORT_FOR],
  });
  const receipt = await params.publicClient.waitForTransactionReceipt({ hash: txHash });

  return GovernanceTxResultSchema.parse({
    txHash,
    blockNumber: Number(receipt.blockNumber),
  });
}

export async function queueAction(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  payload: GovernanceActionPayload;
}): Promise<GovernanceTxResult> {
  const proposal = buildGovernanceProposal(params.payload);

  const txHash = await params.walletClient.writeContract({
    account: params.account,
    chain: params.walletClient.chain,
    address: params.payload.governorAddress as Address,
    abi: governorAbi,
    functionName: "queue",
    args: [proposal.targets, proposal.values, proposal.calldatas, proposal.descriptionHash],
  });
  const receipt = await params.publicClient.waitForTransactionReceipt({ hash: txHash });

  return GovernanceTxResultSchema.parse({
    txHash,
    blockNumber: Number(receipt.blockNumber),
  });
}

export async function executeAction(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  payload: GovernanceActionPayload;
}): Promise<GovernanceTxResult> {
  const proposal = buildGovernanceProposal(params.payload);

  const txHash = await params.walletClient.writeContract({
    account: params.account,
    chain: params.walletClient.chain,
    address: params.payload.governorAddress as Address,
    abi: governorAbi,
    functionName: "execute",
    args: [proposal.targets, proposal.values, proposal.calldatas, proposal.descriptionHash],
  });
  const receipt = await params.publicClient.waitForTransactionReceipt({ hash: txHash });

  return GovernanceTxResultSchema.parse({
    txHash,
    blockNumber: Number(receipt.blockNumber),
  });
}

export async function readProposalState(params: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
}) {
  return Number(
    await params.publicClient.readContract({
      address: params.governorAddress,
      abi: governorAbi,
      functionName: "state",
      args: [params.proposalId],
    }),
  );
}
