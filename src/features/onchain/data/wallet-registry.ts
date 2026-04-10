/**
 * Static wallet registry.
 * `rdns` follows EIP-6963 reverse-domain notation. When wagmi's
 * `multiInjectedProviderDiscovery: true` is set, discovered connectors will
 * have `connector.rdns` set to the wallet's EIP-6963 identifier.
 * `id` is the wagmi connector id fallback (used when rdns matching fails).
 * `installUrl` is the official extension/app install page.
 */
export type WalletEntry = {
  id: string; // wagmi connector id fallback
  name: string;
  rdns?: string; // EIP-6963 rdns — primary matching key for discovered wallets
  installUrl: string;
  icon: string; // inline SVG string
};

export const walletRegistry: WalletEntry[] = [
  {
    id: "io.metamask",
    name: "MetaMask",
    rdns: "io.metamask",
    installUrl: "https://metamask.io/download/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <path d="M36.18 3 21.84 13.56l2.65-6.27L36.18 3z" fill="#E2761B" stroke="#E2761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.81 3l14.22 10.66-2.52-6.37L3.81 3z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M31.06 27.37l-3.82 5.84 8.17 2.25 2.34-7.94-6.69-.15z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.27 27.52l2.33 7.94 8.17-2.25-3.82-5.84-6.68.15z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.28 17.9l-2.27 3.43 8.09.36-.28-8.69-5.54 4.9z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27.71 17.9l-5.62-5-1.84 8.79 8.09-.36-2.63-3.43z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.77 33.21l4.87-2.37-4.2-3.28-.67 5.65z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22.35 30.84l4.88 2.37-.68-5.65-4.2 3.28z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27.23 33.21l-4.88-2.37.39 3.19-.04 1.34 4.53-2.16z" fill="#D7C1B3" stroke="#D7C1B3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.77 33.21l4.52 2.16-.03-1.34.39-3.19-4.88 2.37z" fill="#D7C1B3" stroke="#D7C1B3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.36 25.71l-4.06-1.19 2.86-1.31 1.2 2.5z" fill="#233447" stroke="#233447" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22.63 25.71l1.2-2.5 2.87 1.31-4.07 1.19z" fill="#233447" stroke="#233447" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.77 33.21l.7-5.84-4.52.13 3.82 5.71z" fill="#CD6116" stroke="#CD6116" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M26.52 27.37l.7 5.84 3.83-5.71-4.53-.13z" fill="#CD6116" stroke="#CD6116" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28.24 21.33l-8.09.36.75 4.02 1.2-2.5 2.87 1.31 3.27-3.19z" fill="#CD6116" stroke="#CD6116" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.3 24.52l2.87-1.31 1.19 2.5.75-4.02-8.09-.36 3.28 3.19z" fill="#CD6116" stroke="#CD6116" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.01 21.33l3.39 6.62-.11-3.43-3.28-3.19z" fill="#E4751F" stroke="#E4751F" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M26.71 27.95l-.1 3.43 3.38-6.05-3.28-3.43z" fill="#E4751F" stroke="#E4751F" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18.85 21.69l-.75 4.02.94 4.86.21-6.4-.4-2.48z" fill="#E4751F" stroke="#E4751F" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21.14 21.69l-.39 2.47.2 6.41.94-4.86-.75-4.02z" fill="#E4751F" stroke="#E4751F" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21.89 25.71l-.94 4.86.67.47 4.2-3.28.1-3.43-4.03 1.38z" fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.3 24.52l.11 3.43 4.2 3.28.67-.47-.94-4.86-4.04-1.38z" fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21.96 35.37l.04-1.34-.37-.32h-3.27l-.35.32.03 1.34-4.52-2.16 1.58 1.3 3.2 2.22h3.49l3.2-2.21 1.57-1.3-4.6 2.15z" fill="#C0AD9E" stroke="#C0AD9E" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21.68 30.84l-.67-.47h-2.02l-.67.47-.39 3.19.35-.32h3.27l.37.32-.24-3.19z" fill="#161616" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M36.95 14.19l1.22-5.9L36.18 3l-14.5 10.77 5.57 4.72 7.87 2.3 1.74-2.03-.76-.55 1.21-1.1-.93-.72 1.21-.94-.64-.86z" fill="#763D16" stroke="#763D16" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1.83 8.29l1.22 5.9-.78.58 1.22.94-.93.72 1.21 1.1-.76.55 1.73 2.03 7.87-2.3 5.57-4.72L3.81 3 1.83 8.29z" fill="#763D16" stroke="#763D16" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M35.12 20.79l-7.87-2.3 2.63 3.43-3.38 6.05 4.48-.06h6.69l-2.55-7.12z" fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.74 18.49l-7.87 2.3-2.6 7.12h6.69l4.47.06-3.38-6.05 2.69-3.43z" fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21.14 21.69l.5-8.69 2.27-6.14H16.1l2.26 6.14.5 8.69.19 2.49.01 6.39h2.02l.02-6.39.04-2.49z" fill="#F6851B" stroke="#F6851B" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "coinbaseWalletSDK",
    name: "Coinbase Wallet",
    rdns: "com.coinbase.wallet",
    installUrl: "https://www.coinbase.com/wallet/downloads",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#0052FF"/>
  <path d="M20 6C12.27 6 6 12.27 6 20s6.27 14 14 14 14-6.27 14-14S27.73 6 20 6zm0 5.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8zm-4.2 6.3v4.2h8.4v-4.2h-8.4z" fill="#fff"/>
</svg>`,
  },
  {
    id: "io.rabby",
    name: "Rabby",
    rdns: "io.rabby",
    installUrl: "https://rabby.io/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#8697FF"/>
  <path d="M28.5 16.5c0-3.59-2.91-6.5-6.5-6.5h-8v20h4v-6h3l3.5 6h4.5l-3.8-6.5c1.95-1.07 3.3-3.12 3.3-5.5zm-10.5 4v-7h4a3.5 3.5 0 1 1 0 7h-4z" fill="#fff"/>
</svg>`,
  },
  {
    id: "com.okex.wallet",
    name: "OKX Wallet",
    rdns: "com.okex.wallet",
    installUrl: "https://www.okx.com/web3",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#000"/>
  <rect x="8" y="8" width="9.6" height="9.6" rx="1.5" fill="#fff"/>
  <rect x="22.4" y="8" width="9.6" height="9.6" rx="1.5" fill="#fff"/>
  <rect x="15.2" y="15.2" width="9.6" height="9.6" rx="1.5" fill="#fff"/>
  <rect x="8" y="22.4" width="9.6" height="9.6" rx="1.5" fill="#fff"/>
  <rect x="22.4" y="22.4" width="9.6" height="9.6" rx="1.5" fill="#fff"/>
</svg>`,
  },
  {
    id: "app.phantom",
    name: "Phantom",
    rdns: "app.phantom",
    installUrl: "https://phantom.app/download",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#AB9FF2"/>
  <path d="M8 20.7c0 7.4 5.6 12.3 13.4 12.3 1.9 0 3.8-.3 5.5-.9.2-.1.3-.2.3-.4v-.1c0-.2-.2-.4-.4-.3-1.5.5-3.1.8-4.8.8C15.2 32.1 10.5 27.4 10.5 20.7c0-6.7 4.7-11.4 11.5-11.4 6.2 0 10.4 3.8 10.4 9.3 0 3.3-1.6 5.5-4.2 5.5-1.2 0-1.8-.6-1.8-1.7 0-.2 0-.5.1-.7l1.4-7.8c.1-.3-.2-.6-.5-.6h-2.6c-.3 0-.5.2-.6.5l-.2.9c-.6-1-1.7-1.6-3.1-1.6-3.6 0-6.5 3.4-6.5 7.5 0 3.3 1.9 5.3 4.9 5.3 1.5 0 2.9-.8 3.9-2.1.5 1.4 1.8 2.2 3.5 2.2 4 0 7-3.1 7-7.4C33.8 13.5 28.6 8 21 8 13 8 8 13.3 8 20.7zm11.7.4c0-2 1.3-3.4 3.1-3.4 1.8 0 2.9 1.3 2.9 3.3 0 2-1.2 3.4-2.9 3.4-1.7 0-3.1-1.3-3.1-3.3z" fill="#fff"/>
</svg>`,
  },
  {
    id: "com.brave.wallet",
    name: "Brave Wallet",
    rdns: "com.brave.wallet",
    installUrl: "https://brave.com/wallet/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#FF5000"/>
  <path d="M29.6 13.5l1.1-3.2-2.1-1.3-1.5 1.5-1.5-1.5H14.4l-1.5 1.5-1.5-1.5-2.1 1.3 1.1 3.2-.7 2.4.3 1.6 4.2 9.8.9 1 2.3 1.6.6.3.6-.3 2.3-1.6.9-1 4.2-9.8.3-1.6-.7-2.4zm-9.6 11.8l-4-9.4h8l-4 9.4z" fill="#fff"/>
</svg>`,
  },
  {
    id: "injected",
    name: "Browser Wallet",
    rdns: undefined,
    installUrl: "https://ethereum.org/en/wallets/find-wallet/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#6B7280"/>
  <rect x="8" y="14" width="24" height="16" rx="3" stroke="#fff" stroke-width="2"/>
  <path d="M8 18h24" stroke="#fff" stroke-width="2"/>
  <circle cx="28" cy="23" r="2" fill="#fff"/>
</svg>`,
  },
];

