import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Layers,
  Network,
  BrainCircuit,
  FileCode2,
  Coins,
  ShieldCheck,
  Plug,
  TrendingUp,
} from "lucide-react";

export interface DocsNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface DocsNavGroup {
  title: string;
  items: DocsNavItem[];
}

export const docsNav: DocsNavGroup[] = [
  {
    title: "Getting Started",
    items: [{ title: "Introduction", href: "/docs", icon: BookOpen }],
  },
  {
    title: "Protocol",
    items: [
      { title: "Layer 2 Architecture", href: "/docs/architecture", icon: Layers },
      { title: "Consensus", href: "/docs/consensus", icon: Network },
      { title: "Oracle & AI Validation", href: "/docs/oracle-ai", icon: BrainCircuit },
    ],
  },
  {
    title: "Development",
    items: [
      { title: "Smart Contracts", href: "/docs/smart-contracts", icon: FileCode2 },
      { title: "API Reference", href: "/docs/api-reference", icon: Plug },
    ],
  },
  {
    title: "Network",
    items: [
      { title: "TRAY Tokenomics", href: "/docs/tokenomics", icon: Coins },
      { title: "Running a Validator", href: "/docs/validators", icon: ShieldCheck },
      { title: "Economic Projections", href: "/docs/economic-projections", icon: TrendingUp },
    ],
  },
];

export const docsNavFlat: DocsNavItem[] = docsNav.flatMap((group) => group.items);
