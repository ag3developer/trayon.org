/**
 * Official TRAY token data — single source of truth for the landing page,
 * docs charts, and whitepaper PDF.
 *
 * TRAY today is an ERC-20 on Polygon PoS with a hard cap of 21,000,000
 * (MAX_SUPPLY in the verified contract). It is planned to become the native
 * gas token of the Trayon chain via a 1:1 migration.
 *
 * Distribution figures are an on-chain snapshot (balanceOf per contract),
 * not a promised vesting schedule. Update SNAPSHOT_DATE and the amounts
 * together when re-reading the chain.
 */

export const TRAY_TOKEN = {
  name: "TRAYON",
  symbol: "TRAY",
  decimals: 18,
  address: "0x6b62514E925099643abA13B322A62ff6298f8E8A",
  chainId: 137,
  network: "Polygon PoS",
  standard: "ERC-20",
  maxSupply: 21_000_000,
  explorerUrl: "https://polygonscan.com/token/0x6b62514E925099643abA13B322A62ff6298f8E8A",
} as const;

export const SNAPSHOT_DATE = "2026-11-13";

export interface AllocationRow {
  key: string;
  name: string;
  /** Whole-token amount held at snapshot time. */
  amount: number;
  /** Contract or wallet holding the allocation (null = spread across holders). */
  holder: string | null;
}

const ROWS: AllocationRow[] = [
  { key: "treasury", name: "Treasury", amount: 4_386_478, holder: "0xd0C5ED74b306b504Fa2A62Ff62284cCBE6232aDe" },
  { key: "staking", name: "Staking rewards", amount: 3_507_000, holder: "0xCae7c27EfeA755f7671945Cd89A3bFC91d882ac5" },
  { key: "liquidity", name: "Liquidity", amount: 3_003_000, holder: "0xd6f040cc6795E62fF75eD2dC9e4Da7a30016D18e" },
  { key: "timelock", name: "Timelock reserve", amount: 3_003_000, holder: "0xb202530e63a66b46625d5f96396Db09C2001707B" },
  { key: "vesting", name: "Vesting", amount: 2_940_000, holder: "0x2F972CA3e5dE50d9232bb6Ddab6365dfbd9E4AEd" },
  { key: "ecosystem", name: "Ecosystem distribution", amount: 2_457_000, holder: "0x85985ecfd13492bfb75d85Aa07015371e8d1Af44" },
];

const allocated = ROWS.reduce((sum, r) => sum + r.amount, 0);

export const TRAY_ALLOCATION: (AllocationRow & { pct: number; label: string })[] = [
  ...ROWS,
  { key: "circulating", name: "Circulating (holders)", amount: TRAY_TOKEN.maxSupply - allocated, holder: null },
].map((r) => ({
  ...r,
  pct: Math.round((r.amount / TRAY_TOKEN.maxSupply) * 10000) / 100,
  label: formatAmount(r.amount),
}));

/** 4386478 -> "4.39M TRAY" */
export function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M TRAY`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K TRAY`;
  return `${n} TRAY`;
}

export function shortAddress(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
