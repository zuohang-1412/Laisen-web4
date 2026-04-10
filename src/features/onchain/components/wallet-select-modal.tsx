"use client";

import { ExternalLink, X } from "lucide-react";
import type { Connector } from "wagmi";

import { walletRegistry } from "@/features/onchain/data/wallet-registry";
import { cn } from "@/lib/utils";

type WalletSelectModalProps = {
  connectors: readonly Connector[];
  connectedConnectorUid?: string | null;
  isConnecting: boolean;
  onConnect: (connector: Connector) => void;
  onClose: () => void;
};

export function WalletSelectModal({
  connectors,
  connectedConnectorUid,
  isConnecting,
  onConnect,
  onClose,
}: WalletSelectModalProps) {
  const items = buildWalletList(connectors);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select wallet"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.12)] bg-[#0e1114]">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-5 py-4">
          <p className="text-sm font-semibold text-white">Select a Wallet</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.08)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-2 px-3 py-3">
          {items.map((item) => {
            const isConnected = item.connector ? connectedConnectorUid === item.connector.uid : false;
            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex items-center justify-between rounded-[14px] px-3 py-3",
                    item.connector ? "cursor-pointer hover:bg-[rgba(255,255,255,0.06)]" : "opacity-70",
                  )}
                  onClick={() => {
                    if (!item.connector || isConnecting) return;
                    onConnect(item.connector);
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-[rgba(255,255,255,0.45)]">
                      {isConnected ? "Connected" : item.connector ? "Ready" : "Not installed"}
                    </p>
                  </div>
                  {item.connector ? (
                    isConnected ? (
                      <span className="site-chip site-chip-ai">Active</span>
                    ) : null
                  ) : (
                    <a
                      href={item.installUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[rgba(255,255,255,0.68)]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Setup
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function buildWalletList(connectors: readonly Connector[]) {
  const connectorByRdns = new Map<string, Connector>();
  const connectorById = new Map<string, Connector>();

  for (const connector of connectors) {
    connectorById.set(connector.id, connector);
    if (typeof connector.rdns === "string") connectorByRdns.set(connector.rdns, connector);
    if (Array.isArray(connector.rdns)) {
      for (const rdns of connector.rdns as string[]) connectorByRdns.set(rdns, connector);
    }
  }

  return walletRegistry.map((entry) => ({
    ...entry,
    connector: (entry.rdns ? connectorByRdns.get(entry.rdns) : undefined) ?? connectorById.get(entry.id),
  }));
}
