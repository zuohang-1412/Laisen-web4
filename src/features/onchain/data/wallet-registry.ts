export type WalletEntry = {
  id: string;
  name: string;
  rdns?: string;
  installUrl: string;
};

export const walletRegistry: WalletEntry[] = [
  {
    id: "io.metamask",
    name: "MetaMask",
    rdns: "io.metamask",
    installUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbaseWalletSDK",
    name: "Coinbase Wallet",
    rdns: "com.coinbase.wallet",
    installUrl: "https://www.coinbase.com/wallet/downloads",
  },
  {
    id: "injected",
    name: "Browser Wallet",
    installUrl: "https://ethereum.org/en/wallets/find-wallet/",
  },
];
