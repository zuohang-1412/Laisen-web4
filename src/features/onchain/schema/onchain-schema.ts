import { z } from "zod";

import { LAISEN_TESTNET_NAME } from "@/features/onchain/config/chains";

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const HashSchema = z.string().regex(/^0x([a-fA-F0-9]{64})$/);
export const ProofEventSchema = z.object({
  name: z.string(),
  source: z.enum(["token", "governor", "timelock", "protocol", "deployment"]),
  txHash: HashSchema,
  blockNumber: z.number().int().nonnegative(),
  detail: z.string(),
});

export const ProtocolPackageSchema = z.object({
  daoName: z.string(),
  daoSummary: z.string(),
  governanceMode: z.string(),
  operatorPolicy: z.string(),
  treasuryModel: z.string(),
  safePath: z.string(),
  founderPersona: z.object({
    name: z.string(),
    role: z.string(),
    directive: z.string(),
  }),
  token: z.object({
    name: z.string(),
    symbol: z.string().min(2).max(8),
    totalSupplyUnits: z.bigint(),
    totalSupplyLabel: z.string(),
    treasuryAllocation: z.string(),
    contributorAllocation: z.string(),
    communityAllocation: z.string(),
  }),
});

export const WalletStatusSchema = z.enum([
  "disconnected",
  "connecting",
  "connected",
  "wrong_network",
  "switching_network",
  "no_test_eth",
  "ready",
  "failed",
]);

export const DeploymentStatusSchema = z.enum([
  "idle",
  "deploying",
  "deployed",
  "fallback_ready",
  "failed",
]);

export const MandateActionStatusSchema = z.enum([
  "idle",
  "awaiting_wallet",
  "signing",
  "approved",
  "rejected",
  "executed",
  "failed",
]);

export const DeploymentProofSchema = z.object({
  status: DeploymentStatusSchema,
  walletAddress: AddressSchema.nullable(),
  chainId: z.number().nullable(),
  chainName: z.string(),
  deploymentTxHash: HashSchema.nullable(),
  deploymentBlockNumber: z.number().int().nonnegative().nullable(),
  tokenAddress: AddressSchema.nullable(),
  governorAddress: AddressSchema.nullable(),
  timelockAddress: AddressSchema.nullable(),
  protocolAddress: AddressSchema.nullable(),
  treasuryAddress: AddressSchema.nullable(),
  blockExplorerUrl: z.string().nullable(),
  events: z.array(ProofEventSchema),
  error: z.string().nullable(),
  usedFallback: z.boolean(),
});

export const MandateProofSchema = z.object({
  status: MandateActionStatusSchema,
  proposalAction: z.enum(["approve", "reject"]).nullable(),
  proposalId: z.bigint().nullable(),
  governorState: z.number().int().nullable(),
  proposalEta: z.bigint().nullable(),
  proposalTxHash: HashSchema.nullable(),
  proposalBlockNumber: z.number().int().nonnegative().nullable(),
  voteTxHash: HashSchema.nullable(),
  voteBlockNumber: z.number().int().nonnegative().nullable(),
  queueTxHash: HashSchema.nullable(),
  queueBlockNumber: z.number().int().nonnegative().nullable(),
  mandateId: HashSchema.nullable(),
  actionTxHash: HashSchema.nullable(),
  actionBlockNumber: z.number().int().nonnegative().nullable(),
  executionHash: HashSchema.nullable(),
  rejectionHash: HashSchema.nullable(),
  blockExplorerUrl: z.string().nullable(),
  events: z.array(ProofEventSchema),
  error: z.string().nullable(),
});

export type ProtocolPackage = z.infer<typeof ProtocolPackageSchema>;
export type WalletStatus = z.infer<typeof WalletStatusSchema>;
export type DeploymentProof = z.infer<typeof DeploymentProofSchema>;
export type MandateProof = z.infer<typeof MandateProofSchema>;
export type ProofEvent = z.infer<typeof ProofEventSchema>;

export function createEmptyDeploymentProof(): DeploymentProof {
  return {
    status: "idle",
    walletAddress: null,
    chainId: null,
    chainName: LAISEN_TESTNET_NAME,
    deploymentTxHash: null,
    deploymentBlockNumber: null,
    tokenAddress: null,
    governorAddress: null,
    timelockAddress: null,
    protocolAddress: null,
    treasuryAddress: null,
    blockExplorerUrl: null,
    events: [],
    error: null,
    usedFallback: false,
  };
}

export function createEmptyMandateProof(): MandateProof {
  return {
    status: "idle",
    proposalAction: null,
    proposalId: null,
    governorState: null,
    proposalEta: null,
    proposalTxHash: null,
    proposalBlockNumber: null,
    voteTxHash: null,
    voteBlockNumber: null,
    queueTxHash: null,
    queueBlockNumber: null,
    mandateId: null,
    actionTxHash: null,
    actionBlockNumber: null,
    executionHash: null,
    rejectionHash: null,
    blockExplorerUrl: null,
    events: [],
    error: null,
  };
}
