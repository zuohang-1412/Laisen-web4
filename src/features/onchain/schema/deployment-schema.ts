import { z } from "zod";

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export const HashSchema = z.string().regex(/^0x([a-fA-F0-9]{64})$/);

export const DeploymentPackageSchema = z.object({
  tokenName: z.string().min(2),
  tokenSymbol: z.string().min(2).max(8),
  totalSupplyUnits: z.bigint(),
});

export const DeploymentReceiptSchema = z.object({
  deployTxHash: HashSchema,
  tokenAddress: AddressSchema,
  timelockAddress: AddressSchema,
  governorAddress: AddressSchema,
  protocolAddress: AddressSchema,
  blockNumber: z.number().int().nonnegative(),
});

export type DeploymentPackage = z.infer<typeof DeploymentPackageSchema>;
export type DeploymentReceipt = z.infer<typeof DeploymentReceiptSchema>;
