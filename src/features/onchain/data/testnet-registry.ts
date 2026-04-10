export type TestnetEntry = {
  name: string;
  icon: string; // inline SVG string
};

export const testnetRegistry: TestnetEntry[] = [
  {
    name: "Base Sepolia",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#0052FF"/>
  <circle cx="20" cy="20" r="8.4" fill="none" stroke="#fff" stroke-width="3.4"/>
</svg>`,
  },
  {
    name: "Sepolia",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#2E3238"/>
  <path d="M20 7.5 12 20l8 4.6 8-4.6-8-12.5z" fill="#8A92B2"/>
  <path d="m12 21.5 8 11 8-11-8 4.8-8-4.8z" fill="#C8CDD6"/>
</svg>`,
  },
  {
    name: "Optimism Sepolia",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#FF0420"/>
  <text x="20" y="25" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial, Helvetica, sans-serif" font-weight="700">OP</text>
</svg>`,
  },
  {
    name: "Arbitrum Sepolia",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#0F172A"/>
  <polygon points="20,6.8 30.6,13 30.6,27 20,33.2 9.4,27 9.4,13" fill="#213147"/>
  <path d="M15.2 25.8 18.2 16h3l-3 9.8h-3z" fill="#2D9CDB"/>
  <path d="M20.4 25.8 23.4 16h3l-3 9.8h-3z" fill="#66C2FF"/>
</svg>`,
  },
];

