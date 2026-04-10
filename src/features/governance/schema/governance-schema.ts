import { z } from "zod";

export const HashSchema = z.string().regex(/^0x([a-fA-F0-9]{64})$/);
export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const GovernanceActionPayloadSchema = z.object({
  governorAddress: AddressSchema,
  protocolAddress: AddressSchema,
  mandateId: HashSchema,
  mandateHash: HashSchema,
  signalHash: HashSchema,
  decisionHash: HashSchema,
  executionHash: HashSchema,
  description: z.string().min(4),
});

export const GovernanceTxResultSchema = z.object({
  txHash: HashSchema,
  blockNumber: z.number().int().nonnegative(),
});

export type GovernanceActionPayload = z.infer<typeof GovernanceActionPayloadSchema>;
export type GovernanceTxResult = z.infer<typeof GovernanceTxResultSchema>;
