"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect } from "react";
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
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Build the display list: registry entries first (in order), then any
  // wagmi-discovered connectors not already in the registry.
  const items = buildWalletList(connectors);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select a wallet"
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[#0e1114] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.4)]">
              Connect
            </p>
            <h2 className="mt-1 text-base font-semibold text-white">Select a Wallet</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet list */}
        <ul className="max-h-[420px] overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const isConnected = !!(item.connector && connectedConnectorUid === item.connector.uid);
            const isReady = item.connector !== undefined;

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex items-center gap-4 rounded-[18px] px-3 py-3 transition",
                    isReady
                      ? "cursor-pointer hover:bg-[rgba(255,255,255,0.06)]"
                      : "opacity-60",
                    isConnected && "bg-[rgba(0,229,255,0.06)]",
                  )}
                  onClick={() => {
                    if (isReady && item.connector && !isConnecting) {
                      onConnect(item.connector);
                    }
                  }}
                  role={isReady ? "button" : undefined}
                  tabIndex={isReady ? 0 : -1}
                  onKeyDown={(e) => {
                    if (isReady && item.connector && (e.key === "Enter" || e.key === " ")) {
                      onConnect(item.connector);
                    }
                  }}
                >
                  {/* Icon */}
                  <div
                    className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[12px]"
                    dangerouslySetInnerHTML={{ __html: item.icon }}
                  />

                  {/* Name + status */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p
                      className={cn(
                        "mt-0.5 text-xs",
                        isConnected
                          ? "text-[rgba(0,229,255,0.9)]"
                          : isReady
                            ? "text-[rgba(255,255,255,0.4)]"
                            : "text-[rgba(255,255,255,0.3)]",
                      )}
                    >
                      {isConnected ? "Connected" : isReady ? "Ready" : "Unavailable"}
                    </p>
                  </div>

                  {/* Right action */}
                  <div className="flex-shrink-0">
                    {isConnected ? (
                      <span className="inline-flex h-6 items-center rounded-full bg-[rgba(0,229,255,0.15)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(0,229,255,0.9)]">
                        Active
                      </span>
                    ) : !isReady ? (
                      <a
                        href={item.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.12)] px-3 text-xs font-medium text-[rgba(255,255,255,0.6)] transition hover:border-[rgba(255,255,255,0.28)] hover:text-white"
                      >
                        Setup
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer note */}
        <div className="border-t border-[rgba(255,255,255,0.07)] px-6 py-4">
          <p className="text-center text-xs text-[rgba(255,255,255,0.28)]">
            New to wallets?{" "}
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[rgba(255,255,255,0.6)]"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

type WalletItem = {
  id: string;
  name: string;
  icon: string;
  installUrl: string;
  connector: Connector | undefined;
};

/** Fallback icon for connectors not in the registry */
const genericIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#374151"/>
  <rect x="8" y="14" width="24" height="16" rx="3" stroke="#9CA3AF" stroke-width="2"/>
  <path d="M8 18h24" stroke="#9CA3AF" stroke-width="2"/>
  <circle cx="28" cy="23" r="2" fill="#9CA3AF"/>
</svg>`;

function buildWalletList(connectors: readonly Connector[]): WalletItem[] {
  // Build lookup maps
  const connectorByRdns = new Map<string, Connector>();
  const connectorById = new Map<string, Connector>();

  for (const c of connectors) {
    connectorById.set(c.id, c);
    if (typeof c.rdns === "string") {
      connectorByRdns.set(c.rdns, c);
    } else if (Array.isArray(c.rdns)) {
      for (const r of c.rdns as string[]) connectorByRdns.set(r, c);
    }
  }

  const placed = new Set<string>(); // connector UIDs already placed
  const items: WalletItem[] = [];

  // 1. Registry entries — match by rdns first, then by id
  for (const entry of walletRegistry) {
    const connector =
      (entry.rdns ? connectorByRdns.get(entry.rdns) : undefined) ??
      connectorById.get(entry.id);

    if (connector) placed.add(connector.uid);

    items.push({
      id: entry.rdns ?? entry.id,
      name: entry.name,
      icon: entry.icon,
      installUrl: entry.installUrl,
      connector,
    });
  }

  // 2. Extra EIP-6963 discovered connectors not in the registry
  for (const c of connectors) {
    if (placed.has(c.uid)) continue;
    // Skip the generic "injected" fallback — it's already covered by registry Browser Wallet entry
    if (c.id === "injected") continue;
    items.push({
      id: c.id,
      name: c.name,
      icon: genericIcon,
      installUrl: "https://ethereum.org/en/wallets/find-wallet/",
      connector: c,
    });
  }

  return items;
}

