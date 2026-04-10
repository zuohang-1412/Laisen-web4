export type ProofEvent = {
  id: string;
  label: string;
  detail: string;
  at: string;
};

export type ProofSnapshot = {
  version: 1;
  runId: string;
  status: "pending" | "running" | "completed" | "failed";
  events: ProofEvent[];
  updatedAt: number;
};
