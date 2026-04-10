"use client";

import { useState } from "react";

import { LAISEN_TESTNET_NAME } from "@/features/onchain/config/chains";
import { WalletSelectModal } from "@/features/onchain/components/wallet-select-modal";
import { useWalletNetwork } from "@/features/onchain/hooks/use-wallet-network";

export function RuntimeWalletNetworkStage() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const onchain = useWalletNetwork();

  return (
    <>
      <section className="site-section py-10 md:py-14">
        <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
          <p className="site-eyebrow">Wallet + network module</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem]">
            Runtime signer readiness
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
            This branch adds wallet connection and target-network switching only.
          </p>

          <dl className="mt-6 grid gap-3 border-t border-[var(--site-line)] pt-4 text-sm">
            <MetaRow label="Status" value={onchain.walletStatus} />
            <MetaRow label="Wallet" value={onchain.activeConnector?.name ?? "Not connected"} />
            <MetaRow label="Address" value={shortAddress(onchain.walletAddress)} />
            <MetaRow label="Chain" value={onchain.chainName} />
            <MetaRow label="Balance" value={formatBalance(onchain.walletBalanceEth)} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setWalletModalOpen(true)} className="site-primary-cta h-10">
              Connect Wallet
            </button>
            <button type="button" onClick={() => void onchain.switchToTargetNetwork()} className="site-secondary-button h-10">
              Switch to {LAISEN_TESTNET_NAME}
            </button>
            <button type="button" onClick={() => onchain.disconnectWallet()} className="site-secondary-button h-10">
              Disconnect
            </button>
          </div>

          {onchain.connectError ? (
            <p className="mt-3 text-sm text-[#b04b4b]">Connect error: {onchain.connectError}</p>
          ) : null}
          {onchain.switchError ? (
            <p className="mt-1 text-sm text-[#b04b4b]">Switch error: {onchain.switchError}</p>
          ) : null}
        </div>
      </section>

      {walletModalOpen ? (
        <WalletSelectModal
          connectors={onchain.connectors}
          connectedConnectorUid={onchain.activeConnector?.uid ?? null}
          isConnecting={onchain.walletStatus === "connecting"}
          onConnect={(connector) => {
            void onchain.connectWallet(connector);
            setWalletModalOpen(false);
          }}
          onClose={() => setWalletModalOpen(false)}
        />
      ) : null}
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
      <dt className="site-eyebrow">{label}</dt>
      <dd className="text-sm text-[var(--site-text-secondary)]">{value}</dd>
    </div>
  );
}

function shortAddress(value: string | null) {
  if (!value) return "Not connected";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatBalance(value: string | null) {
  if (!value) return "n/a";
  return `${Number.parseFloat(value).toFixed(4)} ETH`;
}
