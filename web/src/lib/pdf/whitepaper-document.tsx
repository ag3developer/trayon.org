import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle,
  Line,
  Rect,
} from "@react-pdf/renderer";

/* ------------------------------------------------------------------------ */
/*  Design tokens                                                          */
/* ------------------------------------------------------------------------ */

const color = {
  bg: "#060910",
  panel: "#0d1220",
  panelAlt: "#10172a",
  border: "#1f2937",
  borderSoft: "#1a2233",
  text: "#eef1f6",
  muted: "#8b95a7",
  mutedSoft: "#6b7484",
  accent: "#35d0b0",
  accentDark: "#0f9c82",
  violet: "#a78bfa",
  gold: "#e7c66b",
  rose: "#f472b6",
  blue: "#60a5fa",
  white: "#ffffff",
};

const PIE_COLORS = [color.accent, color.violet, color.blue, color.gold, color.rose, "#f87171"];

const styles = StyleSheet.create({
  page: {
    paddingTop: 78,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: color.bg,
    color: color.text,
  },
  coverPage: {
    padding: 0,
    fontFamily: "Helvetica",
    backgroundColor: color.bg,
    color: color.text,
  },

  /* ---- fixed header / footer ---- */
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 46,
    paddingHorizontal: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: color.borderSoft,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: { width: 14, height: 14, marginRight: 6 },
  headerBrandText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: color.text,
    letterSpacing: 1.5,
  },
  headerSection: {
    fontSize: 8,
    color: color.mutedSoft,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  footerText: { fontSize: 7.5, color: color.mutedSoft, letterSpacing: 0.5 },
  footerPage: { fontSize: 7.5, color: color.mutedSoft },

  /* ---- typography ---- */
  eyebrow: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  h1: {
    fontSize: 21,
    fontFamily: "Helvetica-Bold",
    color: color.white,
    marginBottom: 8,
    lineHeight: 1.25,
  },
  h2: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: color.white,
    marginTop: 16,
    marginBottom: 8,
  },
  intro: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: color.muted,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 9.7,
    lineHeight: 1.65,
    color: color.text,
    marginBottom: 9,
    textAlign: "justify",
  },
  sectionDivider: {
    height: 2,
    width: 34,
    backgroundColor: color.accent,
    marginBottom: 14,
  },
  pageNumBadge: {
    fontSize: 9,
    color: color.mutedSoft,
  },

  /* ---- generic layout ---- */
  row: { flexDirection: "row" },
  col: { flexDirection: "column" },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  spacer8: { height: 8 },
  spacer14: { height: 14 },
  spacer20: { height: 20 },

  /* ---- cards ---- */
  card: {
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 4,
    padding: 12,
  },
  cardQuarter: {
    width: "23.4%",
  },
  cardHalf: {
    width: "48.5%",
  },
  cardTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 8.7,
    lineHeight: 1.5,
    color: color.muted,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: color.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 7.6,
    color: color.mutedSoft,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  /* ---- bullets ---- */
  bulletRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.accent,
    marginTop: 4,
    marginRight: 7,
  },
  bulletText: {
    fontSize: 9.4,
    lineHeight: 1.55,
    color: color.text,
    flex: 1,
  },
  bulletTextBold: {
    fontFamily: "Helvetica-Bold",
    color: color.white,
  },

  /* ---- table ---- */
  table: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 3,
    marginTop: 6,
    marginBottom: 6,
    overflow: "hidden",
  },
  tHeadRow: {
    flexDirection: "row",
    backgroundColor: color.panelAlt,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: color.borderSoft,
  },
  tRowLast: {
    flexDirection: "row",
  },
  tHeadCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    padding: 7,
  },
  tCell: {
    fontSize: 8.8,
    color: color.text,
    padding: 7,
  },
  tCellMuted: {
    fontSize: 8.5,
    color: color.muted,
    padding: 7,
  },

  /* ---- legend ---- */
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendSwatch: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { fontSize: 8.6, color: color.text, flex: 1 },
  legendValue: { fontSize: 8.6, fontFamily: "Helvetica-Bold", color: color.white },

  /* ---- TOC ---- */
  tocRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSoft,
  },
  tocIndex: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    width: 24,
  },
  tocLabel: { fontSize: 10.5, color: color.text, flex: 1 },
  tocPage: { fontSize: 10, color: color.mutedSoft },

  /* badges */
  badge: {
    fontSize: 8,
    color: color.text,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
  },
});

/* ------------------------------------------------------------------------ */
/*  Pie chart helpers (real SVG arcs, not decoration)                      */
/* ------------------------------------------------------------------------ */

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const isFullCircle = endAngle - startAngle >= 359.99;
  if (isFullCircle) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

function PieChart({ data, size = 108 }: { data: PieSlice[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const slices = data.reduce<{ path: string; color: string }[]>((acc, d, idx) => {
    const priorAngle = data
      .slice(0, idx)
      .reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
    const angle = (d.value / total) * 360;
    const path = describeArc(cx, cy, r, priorAngle, priorAngle + angle);
    acc.push({ path, color: d.color });
    return acc;
  }, []);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, idx) => (
        <Path key={idx} d={s.path} fill={s.color} />
      ))}
      <Circle cx={cx} cy={cy} r={r * 0.52} fill={color.bg} />
    </Svg>
  );
}

/* ------------------------------------------------------------------------ */
/*  Header / Footer (fixed on every content page)                          */
/* ------------------------------------------------------------------------ */

function PageFrame({
  section,
  logoMark,
  brand,
}: {
  section: string;
  logoMark?: string;
  brand: string;
}) {
  return (
    <>
      <View style={styles.headerBar} fixed>
        <View style={styles.headerBrand}>
          {logoMark ? <Image src={logoMark} style={styles.headerLogo} /> : null}
          <Text style={styles.headerBrandText}>TRAYON</Text>
        </View>
        <Text style={styles.headerSection}>{section}</Text>
      </View>
      <View style={styles.footerBar} fixed>
        <Text style={styles.footerText}>{brand}</Text>
        <Text
          style={styles.footerPage}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.h1}>{title}</Text>
      <View style={styles.sectionDivider} />
    </>
  );
}

/* ------------------------------------------------------------------------ */
/*  Content model                                                           */
/* ------------------------------------------------------------------------ */

type Locale = "en" | "pt";

interface WhitepaperDocumentProps {
  locale?: string;
  logoMark?: string;
}

const TOKEN_ALLOCATION = [
  { key: "launch", pct: 25 },
  { key: "treasury", pct: 25 },
  { key: "validators", pct: 20 },
  { key: "team", pct: 15 },
  { key: "partnerships", pct: 10 },
  { key: "reserve", pct: 5 },
] as const;

const ROADMAP_PHASES = [
  { period: "Q3–Q4 2026", key: "testnet" },
  { period: "Q1–Q2 2027", key: "beta" },
  { period: "Q3–Q4 2027", key: "expansion" },
  { period: "2028+", key: "standard" },
] as const;

const REGIONS = ["Frankfurt", "Singapore", "São Paulo", "New York", "Sydney", "Cape Town"];

const dictionaries: Record<Locale, any> = {
  en: {
    docTitle: "Trayon Protocol",
    docSubtitle: "Whitepaper — Global Data Integrity Infrastructure",
    version: "Version 1.0",
    updated: "August 2026",
    classification: "Public Release",
    coverTagline:
      "Real-time proof for the data the world depends on — decentralized AI validation settled on a Layer 2 blockchain.",
    footerBrand: "Trayon Protocol Whitepaper · v1.0 · Confidential draft for review",
    toc: {
      title: "Table of Contents",
      items: [
        "Executive Summary",
        "Manifesto & Mission",
        "The Problem",
        "Layer 2 Architecture",
        "Oracle & AI Consensus",
        "Use Cases",
        "TRAY Tokenomics",
        "Development Roadmap",
        "Global Expansion Strategy",
        "Contact & Partnerships",
      ],
    },
    exec: {
      section: "Executive Summary",
      eyebrow: "01 — Executive Summary",
      title: "A verification layer for the data institutions can't afford to get wrong",
      intro:
        "Trayon is a decentralized data-integrity infrastructure that fuses a Layer 2 blockchain settlement layer with an ensemble of AI validators. The protocol ingests critical data from independent sources, cross-validates it through machine intelligence, reaches consensus among 1,000+ staked validators, and settles a cryptographic proof on Ethereum — creating an auditable, tamper-proof record for governments, corporations, courts, and financial markets.",
      stats: [
        { value: "1,000+", label: "Distributed validators" },
        { value: "6", label: "Continents covered" },
        { value: "<5 min", label: "Data verification time" },
        { value: "99.99%", label: "Network uptime target" },
      ],
      highlights: [
        { title: "Zero Trust Data", body: "No single source is ever trusted — every value is independently re-derived and cross-checked before commitment." },
        { title: "AI + BFT consensus", body: "An ensemble of fraud, anomaly, and forecasting models must agree before validators vote under a modified PBFT." },
        { title: "ZK-settled proofs", body: "Commitments are finalized on Ethereum L1 via Polygon CDK using succinct ZK-SNARK proofs." },
      ],
    },
    manifesto: {
      section: "Manifesto & Mission",
      eyebrow: "02 — Manifesto & Mission",
      title: "Manifesto & Mission",
      intro:
        "Trayon exists to build the global layer of data integrity — public and private — eliminating manipulation, fraud, and opacity through the convergence of decentralized artificial intelligence and blockchain security.",
      paragraphs: [
        "The world's digital transition is structurally undermined: automated processes are still fed by human-entered data, corruption, accounting fraud, and government misreporting. Governments face fraudulent procurement and falsified macroeconomic data. Corporations manipulate balance sheets and hide insolvency. Courts rely on alterable digital evidence. Markets suffer price manipulation and poisoned oracle data.",
        "Trayon's answer is Zero Trust Data: no single source is ever trusted. Every critical data point is captured by independent AI agents, validated by decentralized consensus, sealed with cryptographic proof on-chain, and auditable by any third party — with no intermediary required.",
      ],
      principles: [
        { title: "Universal access", body: "Verifiable information should be reachable by every stakeholder, not gated behind institutional privilege." },
        { title: "Verifiability", body: "Every data point carries a cryptographic proof of authenticity that anyone can independently check." },
        { title: "Decentralization", body: "No single validator, data source, or jurisdiction can control the outcome of a validation." },
        { title: "Transparency", body: "All consensus rounds and slashing events are publicly auditable on-chain." },
        { title: "Interoperability", body: "Trayon is designed to plug into existing government, market, and enterprise systems." },
      ],
    },
    problem: {
      section: "The Problem",
      eyebrow: "03 — The Problem",
      title: "Institutions verify data too slowly to prevent damage",
      intro:
        "Budgets, audits, market feeds, and legal records rely on centralized reporting that arrives weeks or months late — with no way to prove it wasn't altered.",
      items: [
        { title: "Delayed verification", body: "Audited data often arrives months after the fact, long after decisions are made." },
        { title: "Opaque reporting", body: "Citizens and counterparties have no independent way to confirm public or corporate figures." },
        { title: "Manual, costly audits", body: "Traditional audit cycles consume 5–10% of institutional budgets with limited real-time value." },
        { title: "Fragmented oracles", body: "Single-source data feeds remain vulnerable to manipulation and single points of failure." },
      ],
    },
    architecture: {
      section: "Layer 2 Architecture",
      eyebrow: "04 — System Architecture",
      title: "Layer 2 settlement, decentralized validation, global footprint",
      intro:
        "Trayon is a decentralized Layer 2 built with Polygon CDK (Chain Development Kit), optimized for high-availability data capture and validation, real-time AI oracle processing, and low-cost transactions secured by Ethereum through ZK-proofs.",
      paragraphs: [
        "The stack is organized in four layers: application use cases (GovTech, corporate, judicial, markets) at the top; Trayon smart contracts (Oracle Manager, Validator Registry, TRAY token, prediction markets) below that; the Trayon Layer 2 itself (sequencer, EVM-compatible state machine, validator nodes, AI consensus engine); and finally ZK-proving with data availability, batching proofs to Ethereum/Polygon for final settlement.",
        "Consensus follows a modified PBFT model requiring a 2/3+1 quorum among 1,000+ staked validators, with BLS signature aggregation for efficiency and slashing penalties for provable misbehavior.",
      ],
      stackLabels: ["Application layer — GovTech, Corporate, Judicial, Markets", "Trayon smart contracts — Oracle Manager, Validator Registry, TRAY, Markets", "Trayon Layer 2 — Sequencer, EVM state machine, AI consensus engine", "ZK-proving & data availability — settlement to Ethereum via Polygon CDK"],
      layers: [
        { title: "Settlement", body: "Polygon CDK Layer 2, finalized on Ethereum L1 via ZK-SNARK proofs." },
        { title: "Consensus", body: "Modified PBFT, 2/3+1 quorum, BLS signature aggregation, slashing for misbehavior." },
        { title: "AI validation", body: "Ensemble voting across fraud detection, anomaly detection, and forecasting models." },
        { title: "Data availability", body: "Hybrid approach combining Polygon CDK DA with Ethereum blob storage." },
      ],
      regionsLabel: "Validator regions",
    },
    oracle: {
      section: "Oracle & AI Consensus",
      eyebrow: "05 — Oracle & AI Consensus",
      title: "Two-layer verification: AI ensemble, then validator quorum",
      intro:
        "Data ingestion begins with independent agents pulling from official APIs, transparency portals, and market feeds across regions — never from a single centralized source.",
      paragraphs: [
        "Each data point is processed by an ensemble of AI models (fraud detection, anomaly detection, and forecasting) that must reach statistical agreement before a value is proposed to the network. Validators then vote under the PBFT consensus layer, and only data that clears both AI ensemble agreement and validator quorum is committed on-chain with a verifiable proof.",
        "This two-layer design — AI ensemble plus decentralized validator consensus — is what allows Trayon to detect manipulation patterns in real time rather than discovering them in a retrospective audit months later.",
      ],
      flow: [
        { title: "Ingest", body: "Independent sources feed government, market, and enterprise data into the network." },
        { title: "Validate", body: "An ensemble of AI models votes on anomalies, fraud signals, and statistical consistency." },
        { title: "Consensus", body: "1,000+ staked validators confirm results under a modified PBFT with BLS aggregation." },
        { title: "Settle", body: "A ZK-verified commitment is settled on Ethereum L1 through Polygon CDK." },
      ],
    },
    useCases: {
      section: "Use Cases",
      eyebrow: "06 — Use Cases",
      title: "Built for the data institutions can't afford to get wrong",
      items: [
        { title: "Government & Public Sector", body: "Real-time budget execution, procurement transparency, and verified macroeconomic indicators." },
        { title: "Corporate & Accounting", body: "Continuous fraud detection, solvency signals, and ESG and supply-chain verification." },
        { title: "Judicial & Legal", body: "Immutable evidence records, case-timeline auditing, and tamper-proof filings." },
        { title: "Markets & Finance", body: "AI-consensus price oracles and early detection of market manipulation." },
      ],
    },
    tokenomics: {
      section: "TRAY Tokenomics",
      eyebrow: "07 — TRAY Tokenomics",
      title: "Economics designed for long-term network security",
      intro:
        "TRAY is the native token securing the Trayon network — engineered as an infrastructure cost, not a speculative instrument. Total supply is fixed at 1,000,000,000 TRAY, with 25% released at launch and the remainder unlocked across validator rewards, ecosystem growth, and long-term treasury schedules.",
      facts: [
        { value: "1B TRAY", label: "Total supply" },
        { value: "250M TRAY", label: "Initial circulating (25%)" },
        { value: "32,000 TRAY", label: "Minimum validator stake" },
        { value: "20%", label: "Gas fee burn rate" },
      ],
      allocationTitle: "Initial supply allocation — 1,000,000,000 TRAY",
      allocation: [
        { key: "launch", label: "Initial Launch (IDO / Private)", detail: "100M private round · 100M public sale · 50M liquidity pools" },
        { key: "treasury", label: "DAO Treasury (Governance)", detail: "Future development, growth incentives, emergency fund" },
        { key: "validators", label: "Validators & Operators", detail: "100M rewards (years 1–5) · 50M initial incentives · 50M security fund" },
        { key: "team", label: "Development Team", detail: "50M founders · 50M engineering · 50M research & security (4-yr vesting)" },
        { key: "partnerships", label: "Partnerships & Integrations", detail: "50M exchanges/market makers · 25M API integrations · 25M gov/corporate" },
        { key: "reserve", label: "Strategic Reserve", detail: "Emergency volatility buffer, security forks, extraordinary DAO decisions" },
      ],
      utilitiesTitle: "Token utility",
      utilities: [
        { title: "Native gas token", body: "All Layer 2 transaction fees are paid in TRAY, removing the need to hold a separate gas asset." },
        { title: "Validator staking", body: "Operating a validator requires locking 32,000 TRAY, aligning incentives with network security." },
        { title: "Data marketplace access", body: "Enterprises and agencies spend TRAY to query audited datasets and analytical reports." },
        { title: "Quadratic governance", body: "Protocol votes use quadratic weighting, preventing whale-dominated decision-making." },
      ],
      burnTitle: "Fee distribution per transaction",
      burnSplit: [
        { label: "Validators (rewards)", pct: 70, color: color.accent },
        { label: "Fee burn (deflation)", pct: 20, color: color.rose },
        { label: "DAO treasury", pct: 10, color: color.violet },
      ],
    },
    roadmap: {
      section: "Development Roadmap",
      eyebrow: "08 — Development Roadmap",
      title: "From testnet to global standard in five years",
      phases: {
        testnet: { title: "Testnet & MVP", body: "Core contracts, validator onboarding, and initial AI models deployed to a public testnet on Polygon CDK." },
        beta: { title: "Mainnet Beta", body: "Mainnet launch alongside pilot partners across government agencies and financial institutions." },
        expansion: { title: "Global Expansion", body: "Regional compliance rollouts across Europe, Asia-Pacific, and the Americas, paired with localized partnerships." },
        standard: { title: "Industry Standard", body: "Trayon positioned as the default integrity layer for institutional data worldwide." },
      },
    },
    globalization: {
      section: "Global Expansion",
      eyebrow: "09 — Global Expansion Strategy",
      title: "Global infrastructure by design, not a regional pilot",
      paragraphs: [
        "Trayon is designed from day one as global infrastructure, not a regional pilot. Validator nodes are distributed across six continents — with anchor regions in Frankfurt, Singapore, São Paulo, New York, and Sydney — for resilience and jurisdictional neutrality.",
        "Regulatory strategy is regional by design: the protocol is built to accommodate distinct compliance regimes across 150+ countries, with dedicated legal and localization tracks for Europe (MiCA-aligned), the Americas, Asia-Pacific, and the Middle East and Africa.",
      ],
      tiersTitle: "Partnership model",
      tiers: [
        { title: "Government & public sector", body: "Budget offices, statistics agencies, and procurement authorities." },
        { title: "Audit & assurance firms", body: "Big Four-class firms embedding continuous verification into engagements." },
        { title: "Financial institutions", body: "Banks, exchanges, and asset managers consuming validated market data." },
        { title: "Infrastructure & data providers", body: "Cloud, API, and data-feed partners extending network reach." },
      ],
    },
    contact: {
      section: "Contact & Partnerships",
      eyebrow: "10 — Contact & Partnerships",
      title: "Building the integrity layer together",
      intro:
        "Whether you represent a government agency, a financial institution, an audit firm, or a development team — let's talk about how Trayon fits your data integrity needs.",
      channels: [
        { label: "Partnership inquiries", value: "partnerships@trayon.org" },
        { label: "Technical / developers", value: "github.com/trayon-protocol" },
        { label: "General contact", value: "contact@trayon.org" },
        { label: "Documentation", value: "docs.trayon.org" },
      ],
      disclaimer:
        "This document is provided for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any tokens or securities. Figures, timelines, and roadmap items are subject to change based on engineering, regulatory, and market conditions.",
    },
  },
  pt: {
    docTitle: "Trayon Protocol",
    docSubtitle: "Whitepaper — Infraestrutura Global de Integridade de Dados",
    version: "Versão 1.0",
    updated: "Agosto de 2026",
    classification: "Divulgação Pública",
    coverTagline:
      "Prova em tempo real para os dados de que o mundo depende — validação de IA descentralizada liquidada em uma blockchain Layer 2.",
    footerBrand: "Whitepaper Trayon Protocol · v1.0 · Rascunho confidencial para revisão",
    toc: {
      title: "Índice",
      items: [
        "Resumo Executivo",
        "Manifesto & Missão",
        "O Problema",
        "Arquitetura Layer 2",
        "Oráculo & Consenso de IA",
        "Casos de Uso",
        "Tokenomics do TRAY",
        "Roadmap de Desenvolvimento",
        "Estratégia de Expansão Global",
        "Contato & Parcerias",
      ],
    },
    exec: {
      section: "Resumo Executivo",
      eyebrow: "01 — Resumo Executivo",
      title: "Uma camada de verificação para os dados que as instituições não podem errar",
      intro:
        "A Trayon é uma infraestrutura descentralizada de integridade de dados que combina uma camada de liquidação em blockchain Layer 2 com um conjunto de validadores de IA. O protocolo coleta dados críticos de fontes independentes, os valida por meio de inteligência artificial, alcança consenso entre mais de 1.000 validadores com stake e registra uma prova criptográfica na Ethereum — criando um registro auditável e à prova de adulteração para governos, empresas, tribunais e mercados financeiros.",
      stats: [
        { value: "1.000+", label: "Validadores distribuídos" },
        { value: "6", label: "Continentes cobertos" },
        { value: "<5 min", label: "Tempo de verificação de dados" },
        { value: "99,99%", label: "Meta de disponibilidade da rede" },
      ],
      highlights: [
        { title: "Zero Trust Data", body: "Nenhuma fonte é confiável por padrão — cada valor é re-derivado de forma independente e cruzado antes do registro." },
        { title: "Consenso IA + BFT", body: "Um conjunto de modelos de fraude, anomalia e previsão precisa concordar antes que os validadores votem sob um PBFT modificado." },
        { title: "Provas liquidadas via ZK", body: "Os compromissos são finalizados na Ethereum L1 via Polygon CDK usando provas ZK-SNARK sucintas." },
      ],
    },
    manifesto: {
      section: "Manifesto & Missão",
      eyebrow: "02 — Manifesto & Missão",
      title: "Manifesto & Missão",
      intro:
        "A Trayon existe para construir a camada global de integridade de dados — pública e privada — eliminando manipulação, fraude e opacidade por meio da convergência entre inteligência artificial descentralizada e segurança blockchain.",
      paragraphs: [
        "A transição digital do mundo está estruturalmente comprometida: processos automatizados ainda são alimentados por dados inseridos manualmente, corrupção, fraude contábil e relatórios governamentais distorcidos. Governos enfrentam licitações fraudulentas e dados macroeconômicos falsificados. Empresas manipulam balanços e ocultam insolvência. Tribunais dependem de provas digitais alteráveis. Mercados sofrem manipulação de preços e dados de oráculos envenenados.",
        "A resposta da Trayon é o Zero Trust Data: nenhuma fonte única é confiável por padrão. Cada dado crítico é capturado por agentes de IA independentes, validado por consenso descentralizado, registrado com prova criptográfica on-chain e auditável por qualquer terceiro — sem necessidade de intermediários.",
      ],
      principles: [
        { title: "Acesso universal", body: "Informações verificáveis devem estar acessíveis a todas as partes interessadas, sem privilégio institucional." },
        { title: "Verificabilidade", body: "Cada dado carrega uma prova criptográfica de autenticidade que qualquer pessoa pode checar." },
        { title: "Descentralização", body: "Nenhum validador, fonte de dados ou jurisdição isolada controla o resultado de uma validação." },
        { title: "Transparência", body: "Todas as rodadas de consenso e eventos de slashing são publicamente auditáveis on-chain." },
        { title: "Interoperabilidade", body: "A Trayon é desenhada para se integrar a sistemas governamentais, de mercado e corporativos já existentes." },
      ],
    },
    problem: {
      section: "O Problema",
      eyebrow: "03 — O Problema",
      title: "Instituições verificam dados devagar demais para evitar danos",
      intro:
        "Orçamentos, auditorias, cotações de mercado e registros jurídicos dependem de relatórios centralizados que chegam semanas ou meses depois — sem forma de provar que não foram alterados.",
      items: [
        { title: "Verificação tardia", body: "Dados auditados costumam chegar meses depois dos fatos, muito após as decisões serem tomadas." },
        { title: "Relatórios opacos", body: "Cidadãos e contrapartes não têm forma independente de confirmar números públicos ou corporativos." },
        { title: "Auditorias manuais e caras", body: "Ciclos tradicionais de auditoria consomem 5–10% dos orçamentos institucionais com pouco valor em tempo real." },
        { title: "Oráculos fragmentados", body: "Fontes de dados únicas permanecem vulneráveis à manipulação e a pontos únicos de falha." },
      ],
    },
    architecture: {
      section: "Arquitetura Layer 2",
      eyebrow: "04 — Arquitetura do Sistema",
      title: "Liquidação em Layer 2, validação descentralizada, alcance global",
      intro:
        "A Trayon é uma Layer 2 descentralizada construída com Polygon CDK (Chain Development Kit), otimizada para captura e validação de dados de alta disponibilidade, processamento de oráculos de IA em tempo real e transações de baixo custo protegidas pela Ethereum via provas ZK.",
      paragraphs: [
        "A pilha é organizada em quatro camadas: casos de uso de aplicação (GovTech, corporativo, judiciário, mercados) no topo; contratos inteligentes da Trayon (Oracle Manager, Validator Registry, token TRAY, mercados de previsão) abaixo; a própria Layer 2 da Trayon (sequenciador, máquina de estados compatível com EVM, nós validadores, motor de consenso de IA); e, por fim, prova ZK com disponibilidade de dados, agrupando provas para liquidação final na Ethereum/Polygon.",
        "O consenso segue um modelo PBFT modificado, exigindo quórum de 2/3+1 entre mais de 1.000 validadores com stake, com agregação de assinaturas BLS para eficiência e penalidades de slashing para má conduta comprovável.",
      ],
      stackLabels: ["Camada de aplicação — GovTech, Corporativo, Judiciário, Mercados", "Contratos inteligentes Trayon — Oracle Manager, Validator Registry, TRAY, Mercados", "Trayon Layer 2 — Sequenciador, máquina EVM, motor de consenso de IA", "Prova ZK & disponibilidade de dados — liquidação via Polygon CDK"],
      layers: [
        { title: "Liquidação", body: "Layer 2 Polygon CDK, finalizada na Ethereum L1 via provas ZK-SNARK." },
        { title: "Consenso", body: "PBFT modificado, quórum de 2/3+1, agregação de assinaturas BLS, slashing para más condutas." },
        { title: "Validação por IA", body: "Votação em conjunto entre modelos de detecção de fraude, anomalias e previsão." },
        { title: "Disponibilidade de dados", body: "Abordagem híbrida combinando Polygon CDK DA com armazenamento blob da Ethereum." },
      ],
      regionsLabel: "Regiões de validadores",
    },
    oracle: {
      section: "Oráculo & Consenso de IA",
      eyebrow: "05 — Oráculo & Consenso de IA",
      title: "Verificação em duas camadas: conjunto de IA e, depois, quórum de validadores",
      intro:
        "A coleta de dados começa com agentes independentes extraindo informações de APIs oficiais, portais de transparência e cotações de mercado em diferentes regiões — nunca de uma única fonte centralizada.",
      paragraphs: [
        "Cada dado é processado por um conjunto de modelos de IA (detecção de fraude, detecção de anomalias e previsão) que precisam chegar a um consenso estatístico antes que um valor seja proposto à rede. Os validadores votam sob a camada de consenso PBFT, e somente dados que passam tanto pelo acordo do conjunto de IA quanto pelo quórum dos validadores são registrados on-chain com prova verificável.",
        "Esse desenho em duas camadas — conjunto de IA mais consenso descentralizado de validadores — é o que permite à Trayon detectar padrões de manipulação em tempo real, em vez de descobri-los em uma auditoria retrospectiva meses depois.",
      ],
      flow: [
        { title: "Coleta", body: "Fontes independentes alimentam a rede com dados governamentais, de mercado e corporativos." },
        { title: "Validação", body: "Um conjunto de modelos de IA vota sobre anomalias, sinais de fraude e consistência estatística." },
        { title: "Consenso", body: "Mais de 1.000 validadores com stake confirmam os resultados sob um PBFT modificado com agregação BLS." },
        { title: "Registro", body: "Um compromisso verificado por ZK é registrado na Ethereum L1 via Polygon CDK." },
      ],
    },
    useCases: {
      section: "Casos de Uso",
      eyebrow: "06 — Casos de Uso",
      title: "Construído para os dados que as instituições não podem errar",
      items: [
        { title: "Governo & Setor Público", body: "Execução orçamentária em tempo real, transparência em licitações e indicadores macroeconômicos verificados." },
        { title: "Corporativo & Contábil", body: "Detecção contínua de fraude, sinais de solvência e verificação de ESG e cadeia de suprimentos." },
        { title: "Judiciário & Jurídico", body: "Registros de evidências imutáveis, auditoria de linha do tempo processual e protocolos à prova de adulteração." },
        { title: "Mercados & Finanças", body: "Oráculos de preço com consenso de IA e detecção precoce de manipulação de mercado." },
      ],
    },
    tokenomics: {
      section: "Tokenomics do TRAY",
      eyebrow: "07 — Tokenomics do TRAY",
      title: "Economia desenhada para segurança de rede de longo prazo",
      intro:
        "O TRAY é o token nativo que garante a segurança da rede Trayon — concebido como custo de infraestrutura, e não como instrumento especulativo. O fornecimento total é fixo em 1.000.000.000 de TRAY, com 25% liberado no lançamento e o restante distribuído entre recompensas de validadores, crescimento do ecossistema e tesouraria de longo prazo.",
      facts: [
        { value: "1B TRAY", label: "Fornecimento total" },
        { value: "250M TRAY", label: "Circulante inicial (25%)" },
        { value: "32.000 TRAY", label: "Stake mínimo de validador" },
        { value: "20%", label: "Taxa de queima de gas" },
      ],
      allocationTitle: "Alocação do fornecimento inicial — 1.000.000.000 TRAY",
      allocation: [
        { key: "launch", label: "Lançamento Inicial (IDO / Private)", detail: "100M rodada privada · 100M venda pública · 50M pools de liquidez" },
        { key: "treasury", label: "Tesouro DAO (Governança)", detail: "Desenvolvimento futuro, incentivos de crescimento, fundo de emergência" },
        { key: "validators", label: "Validadores & Operadores", detail: "100M recompensas (anos 1–5) · 50M incentivos iniciais · 50M fundo de segurança" },
        { key: "team", label: "Time de Desenvolvimento", detail: "50M fundadores · 50M engenharia · 50M pesquisa & segurança (vesting de 4 anos)" },
        { key: "partnerships", label: "Parcerias & Integrações", detail: "50M exchanges/market makers · 25M integrações de API · 25M governo/corporativo" },
        { key: "reserve", label: "Reserva Estratégica", detail: "Buffer de volatilidade, forks de segurança, decisões extraordinárias da DAO" },
      ],
      utilitiesTitle: "Utilidade do token",
      utilities: [
        { title: "Token de gas nativo", body: "Todas as taxas de transação na Layer 2 são pagas em TRAY, eliminando a necessidade de outro ativo de gas." },
        { title: "Staking de validadores", body: "Operar um validador exige o bloqueio de 32.000 TRAY, alinhando incentivos à segurança da rede." },
        { title: "Acesso ao marketplace de dados", body: "Empresas e órgãos gastam TRAY para consultar datasets auditados e relatórios analíticos." },
        { title: "Governança quadrática", body: "As votações do protocolo usam peso quadrático, evitando decisões dominadas por grandes detentores." },
      ],
      burnTitle: "Distribuição de taxas por transação",
      burnSplit: [
        { label: "Validadores (recompensa)", pct: 70, color: color.accent },
        { label: "Queima de taxa (deflação)", pct: 20, color: color.rose },
        { label: "Tesouro DAO", pct: 10, color: color.violet },
      ],
    },
    roadmap: {
      section: "Roadmap de Desenvolvimento",
      eyebrow: "08 — Roadmap de Desenvolvimento",
      title: "Da testnet ao padrão global em cinco anos",
      phases: {
        testnet: { title: "Testnet & MVP", body: "Contratos principais, onboarding de validadores e primeiros modelos de IA implantados em uma testnet pública na Polygon CDK." },
        beta: { title: "Mainnet Beta", body: "Lançamento da mainnet junto a parceiros piloto em órgãos governamentais e instituições financeiras." },
        expansion: { title: "Expansão Global", body: "Implementações regionais de compliance na Europa, Ásia-Pacífico e Américas, aliadas a parcerias localizadas." },
        standard: { title: "Padrão da Indústria", body: "A Trayon posicionada como a camada padrão de integridade para dados institucionais em todo o mundo." },
      },
    },
    globalization: {
      section: "Expansão Global",
      eyebrow: "09 — Estratégia de Expansão Global",
      title: "Infraestrutura global por desenho, não um piloto regional",
      paragraphs: [
        "A Trayon foi desenhada desde o primeiro dia como infraestrutura global, não como um piloto regional. Os nós validadores estão distribuídos em seis continentes — com regiões-âncora em Frankfurt, Singapura, São Paulo, Nova York e Sydney — para resiliência e neutralidade jurisdicional.",
        "A estratégia regulatória é regional por design: o protocolo é construído para acomodar regimes de compliance distintos em mais de 150 países, com trilhas jurídicas e de localização dedicadas à Europa (alinhada ao MiCA), Américas, Ásia-Pacífico e Oriente Médio e África.",
      ],
      tiersTitle: "Modelo de parcerias",
      tiers: [
        { title: "Governo & setor público", body: "Órgãos de orçamento, institutos de estatística e autoridades de licitação." },
        { title: "Firmas de auditoria", body: "Firmas classe Big Four incorporando verificação contínua em seus trabalhos." },
        { title: "Instituições financeiras", body: "Bancos, exchanges e gestores de ativos consumindo dados de mercado validados." },
        { title: "Provedores de infraestrutura & dados", body: "Parceiros de nuvem, API e feeds de dados que ampliam o alcance da rede." },
      ],
    },
    contact: {
      section: "Contato & Parcerias",
      eyebrow: "10 — Contato & Parcerias",
      title: "Construindo a camada de integridade juntos",
      intro:
        "Se você representa um órgão governamental, uma instituição financeira, uma firma de auditoria ou uma equipe de desenvolvimento — vamos falar sobre como a Trayon atende às suas necessidades de integridade de dados.",
      channels: [
        { label: "Contato para parcerias", value: "partnerships@trayon.org" },
        { label: "Técnico / desenvolvedores", value: "github.com/trayon-protocol" },
        { label: "Contato geral", value: "contact@trayon.org" },
        { label: "Documentação", value: "docs.trayon.org" },
      ],
      disclaimer:
        "Este documento é fornecido apenas para fins informativos e não constitui uma oferta de venda ou solicitação de compra de tokens ou valores mobiliários. Números, prazos e itens do roadmap estão sujeitos a alterações conforme condições técnicas, regulatórias e de mercado.",
    },
  },
};

/* ------------------------------------------------------------------------ */
/*  Small building blocks                                                   */
/* ------------------------------------------------------------------------ */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={[styles.card, styles.cardQuarter]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, body, half }: { title: string; body: string; half?: boolean }) {
  return (
    <View style={[styles.card, half ? styles.cardHalf : styles.cardQuarter]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

function Bullet({ title, body }: { title?: string; body: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>
        {title ? <Text style={styles.bulletTextBold}>{title}: </Text> : null}
        {body}
      </Text>
    </View>
  );
}

/* Architecture stack diagram — layered rectangles, real proportional widths */
function StackDiagram({ labels }: { labels: string[] }) {
  const width = 470;
  const rowHeight = 30;
  const gap = 6;
  const colors = [color.panelAlt, color.panel, color.panelAlt, color.panel];
  const borderColors = [color.accent, color.violet, color.blue, color.gold];
  return (
    <View style={{ marginTop: 6, marginBottom: 4 }}>
      {labels.map((label, idx) => (
        <View
          key={idx}
          style={{
            width: width - idx * 26,
            height: rowHeight,
            backgroundColor: colors[idx % colors.length],
            borderWidth: 1,
            borderColor: borderColors[idx % borderColors.length],
            borderRadius: 3,
            marginBottom: gap,
            alignSelf: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 8.3, color: color.text }}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

/* Oracle flow diagram — four boxes connected by arrow lines */
function FlowDiagram({ steps }: { steps: { title: string; body: string }[] }) {
  const boxWidth = 108;
  const boxHeight = 62;
  const gap = 18;
  const totalWidth = steps.length * boxWidth + (steps.length - 1) * gap;
  return (
    <View style={{ alignItems: "center", marginTop: 8, marginBottom: 6 }}>
      <Svg width={totalWidth} height={boxHeight + 4}>
        {steps.map((_, idx) => {
          const x = idx * (boxWidth + gap);
          return (
            <Rect
              key={`box-${idx}`}
              x={x}
              y={0}
              width={boxWidth}
              height={boxHeight}
              rx={4}
              fill={color.panel}
              stroke={PIE_COLORS[idx % PIE_COLORS.length]}
              strokeWidth={1}
            />
          );
        })}
        {steps.slice(0, -1).map((_, idx) => {
          const x1 = idx * (boxWidth + gap) + boxWidth;
          const x2 = x1 + gap;
          const y = boxHeight / 2;
          return (
            <React.Fragment key={`arrow-${idx}`}>
              <Line x1={x1} y1={y} x2={x2 - 3} y2={y} stroke={color.mutedSoft} strokeWidth={1.4} />
              <Path
                d={`M ${x2 - 3} ${y - 3} L ${x2 + 2} ${y} L ${x2 - 3} ${y + 3} Z`}
                fill={color.mutedSoft}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", marginTop: -boxHeight - 4 }}>
        {steps.map((step, idx) => (
          <View
            key={idx}
            style={{
              width: boxWidth,
              height: boxHeight,
              marginRight: idx === steps.length - 1 ? 0 : gap,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <Text
              style={{
                fontSize: 7.4,
                fontFamily: "Helvetica-Bold",
                color: PIE_COLORS[idx % PIE_COLORS.length],
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              {String(idx + 1).padStart(2, "0")} · {step.title}
            </Text>
            <Text style={{ fontSize: 6.9, color: color.muted, textAlign: "center", lineHeight: 1.3 }}>
              {step.body}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* Roadmap timeline — horizontal line with milestone nodes */
function RoadmapTimeline({ phases }: { phases: { period: string; title: string }[] }) {
  const width = 470;
  const y = 14;
  return (
    <View style={{ marginTop: 6, marginBottom: 4, alignItems: "center" }}>
      <Svg width={width} height={30}>
        <Line x1={10} y1={y} x2={width - 10} y2={y} stroke={color.border} strokeWidth={1.5} />
        {phases.map((_, idx) => {
          const x = 10 + (idx * (width - 20)) / (phases.length - 1 || 1);
          return (
            <Circle key={idx} cx={x} cy={y} r={5} fill={color.bg} stroke={PIE_COLORS[idx % PIE_COLORS.length]} strokeWidth={2} />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", width, justifyContent: "space-between", marginTop: 2 }}>
        {phases.map((phase, idx) => (
          <View key={idx} style={{ width: width / phases.length, alignItems: idx === 0 ? "flex-start" : idx === phases.length - 1 ? "flex-end" : "center" }}>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: PIE_COLORS[idx % PIE_COLORS.length] }}>
              {phase.period}
            </Text>
            <Text style={{ fontSize: 7.4, color: color.text, marginTop: 1 }}>{phase.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------------ */
/*  Document                                                                */
/* ------------------------------------------------------------------------ */

export const WhitepaperDocument: React.FC<WhitepaperDocumentProps> = ({
  locale = "en",
  logoMark,
}) => {
  const key: Locale = locale === "pt" ? "pt" : "en";
  const t = dictionaries[key];

  return (
    <Document
      title={`${t.docTitle} — ${t.docSubtitle}`}
      author="Trayon Protocol Foundation"
      subject="Trayon Protocol Whitepaper"
      creator="Trayon Protocol"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Cover page                                                       */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Svg width="100%" height="100%" viewBox="0 0 595 842">
            <Rect x={0} y={0} width={595} height={842} fill={color.bg} />
            <Circle cx={520} cy={90} r={220} fill={color.accent} opacity={0.07} />
            <Circle cx={40} cy={780} r={180} fill={color.violet} opacity={0.06} />
          </Svg>
        </View>

        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            paddingTop: 56,
            paddingBottom: 56,
            paddingHorizontal: 70,
          }}
        >
          {/* top row */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {logoMark ? <Image src={logoMark} style={{ width: 26, height: 26, marginRight: 9 }} /> : null}
              <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold", color: color.white, letterSpacing: 2 }}>
                TRAYON
              </Text>
            </View>
            <Text style={{ fontSize: 8.5, color: color.mutedSoft, letterSpacing: 1 }}>
              {t.classification.toUpperCase()}
            </Text>
          </View>

          {/* middle block */}
          <View>
            <View style={{ height: 1, backgroundColor: color.border, marginBottom: 26 }} />
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: color.accent, letterSpacing: 2.5, marginBottom: 14 }}>
              TECHNICAL WHITEPAPER
            </Text>
            <Text style={{ fontSize: 33, fontFamily: "Helvetica-Bold", color: color.white, lineHeight: 1.2, marginBottom: 14 }}>
              {t.docTitle}
            </Text>
            <Text style={{ fontSize: 13, color: color.muted, lineHeight: 1.3, marginBottom: 20, maxWidth: 400 }}>
              {t.docSubtitle}
            </Text>
            <Text style={{ fontSize: 10.5, color: color.text, lineHeight: 1.55, maxWidth: 400 }}>
              {t.coverTagline}
            </Text>
            <View style={{ height: 1, backgroundColor: color.border, marginTop: 26 }} />
          </View>

          {/* bottom block */}
          <View>
            <View style={{ flexDirection: "row", gap: 28, marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 7.5, color: color.mutedSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>
                  {key === "pt" ? "Versão" : "Version"}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: color.white }}>{t.version}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 7.5, color: color.mutedSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>
                  {key === "pt" ? "Atualizado em" : "Updated"}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: color.white }}>{t.updated}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 7.5, color: color.mutedSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>
                  TRAY
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: color.white }}>trayon.org</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 8, color: color.mutedSoft }}>© 2026 Trayon Protocol Foundation</Text>
              <Text style={{ fontSize: 8, color: color.mutedSoft }}>docs.trayon.org</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Table of Contents                                                */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.toc.title} logoMark={logoMark} brand={t.footerBrand} />
        <Text style={styles.eyebrow}>{t.docTitle}</Text>
        <Text style={styles.h1}>{t.toc.title}</Text>
        <View style={styles.sectionDivider} />
        <View style={{ marginTop: 10 }}>
          {t.toc.items.map((item: string, idx: number) => (
            <View key={idx} style={styles.tocRow}>
              <Text style={styles.tocIndex}>{String(idx + 1).padStart(2, "0")}</Text>
              <Text style={styles.tocLabel}>{item}</Text>
              <Text style={styles.tocPage}>{String(idx + 3).padStart(2, "0")}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Executive summary                                                */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.exec.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.exec.eyebrow} title={t.exec.title} />
        <Text style={styles.intro}>{t.exec.intro}</Text>

        <View style={styles.grid2}>
          {t.exec.stats.map((s: any, idx: number) => (
            <StatCard key={idx} value={s.value} label={s.label} />
          ))}
        </View>

        <Text style={styles.h2}>{key === "pt" ? "Destaques do protocolo" : "Protocol highlights"}</Text>
        <View style={styles.grid2}>
          {t.exec.highlights.map((h: any, idx: number) => (
            <InfoCard key={idx} title={h.title} body={h.body} half />
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Manifesto & Mission                                              */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.manifesto.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.manifesto.eyebrow} title={t.manifesto.title} />
        <Text style={styles.intro}>{t.manifesto.intro}</Text>
        {t.manifesto.paragraphs.map((p: string, idx: number) => (
          <Text key={idx} style={styles.paragraph}>
            {p}
          </Text>
        ))}
        <Text style={styles.h2}>{key === "pt" ? "Princípios fundamentais" : "Core principles"}</Text>
        {t.manifesto.principles.map((p: any, idx: number) => (
          <Bullet key={idx} title={p.title} body={p.body} />
        ))}
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* The Problem                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.problem.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.problem.eyebrow} title={t.problem.title} />
        <Text style={styles.intro}>{t.problem.intro}</Text>
        <View style={styles.grid2}>
          {t.problem.items.map((it: any, idx: number) => (
            <InfoCard key={idx} title={it.title} body={it.body} half />
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Architecture                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.architecture.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.architecture.eyebrow} title={t.architecture.title} />
        <Text style={styles.intro}>{t.architecture.intro}</Text>

        <StackDiagram labels={t.architecture.stackLabels} />

        {t.architecture.paragraphs.map((p: string, idx: number) => (
          <Text key={idx} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        <View style={styles.grid2}>
          {t.architecture.layers.map((l: any, idx: number) => (
            <InfoCard key={idx} title={l.title} body={l.body} />
          ))}
        </View>

        <Text style={styles.h2}>{t.architecture.regionsLabel}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {REGIONS.map((region) => (
            <Text key={region} style={styles.badge}>
              {region}
            </Text>
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Oracle & AI Consensus                                            */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.oracle.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.oracle.eyebrow} title={t.oracle.title} />
        <Text style={styles.intro}>{t.oracle.intro}</Text>

        <FlowDiagram steps={t.oracle.flow} />

        {t.oracle.paragraphs.map((p: string, idx: number) => (
          <Text key={idx} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Use Cases                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.useCases.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.useCases.eyebrow} title={t.useCases.title} />
        <View style={styles.grid2}>
          {t.useCases.items.map((it: any, idx: number) => (
            <InfoCard key={idx} title={it.title} body={it.body} half />
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Tokenomics                                                       */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.tokenomics.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.tokenomics.eyebrow} title={t.tokenomics.title} />
        <Text style={styles.intro}>{t.tokenomics.intro}</Text>

        <View style={styles.grid2}>
          {t.tokenomics.facts.map((f: any, idx: number) => (
            <StatCard key={idx} value={f.value} label={f.label} />
          ))}
        </View>

        <Text style={styles.h2}>{t.tokenomics.allocationTitle}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <PieChart
            data={TOKEN_ALLOCATION.map((a, idx) => ({
              label: a.key,
              value: a.pct,
              color: PIE_COLORS[idx % PIE_COLORS.length],
            }))}
            size={104}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            {TOKEN_ALLOCATION.map((a, idx) => {
              const entry = t.tokenomics.allocation.find((x: any) => x.key === a.key);
              return (
                <View key={a.key} style={styles.legendRow}>
                  <View style={[styles.legendSwatch, { backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }]} />
                  <Text style={styles.legendLabel}>{entry?.label}</Text>
                  <Text style={styles.legendValue}>{a.pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.table}>
          {TOKEN_ALLOCATION.map((a, idx) => {
            const entry = t.tokenomics.allocation.find((x: any) => x.key === a.key);
            const isLast = idx === TOKEN_ALLOCATION.length - 1;
            return (
              <View key={a.key} style={isLast ? styles.tRowLast : styles.tRow}>
                <Text style={[styles.tCell, { width: "34%", fontFamily: "Helvetica-Bold" }]}>{entry?.label}</Text>
                <Text style={[styles.tCellMuted, { width: "50%" }]}>{entry?.detail}</Text>
                <Text style={[styles.tCell, { width: "16%", textAlign: "right" }]}>{a.pct}%</Text>
              </View>
            );
          })}
        </View>
      </Page>

      {/* Tokenomics — utility + fee split (page 2 of tokenomics) */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.tokenomics.section} logoMark={logoMark} brand={t.footerBrand} />
        <Text style={styles.h2}>{t.tokenomics.utilitiesTitle}</Text>
        <View style={styles.grid2}>
          {t.tokenomics.utilities.map((u: any, idx: number) => (
            <InfoCard key={idx} title={u.title} body={u.body} half />
          ))}
        </View>

        <Text style={styles.h2}>{t.tokenomics.burnTitle}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <PieChart
            data={t.tokenomics.burnSplit.map((b: any) => ({ label: b.label, value: b.pct, color: b.color }))}
            size={92}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            {t.tokenomics.burnSplit.map((b: any, idx: number) => (
              <View key={idx} style={styles.legendRow}>
                <View style={[styles.legendSwatch, { backgroundColor: b.color }]} />
                <Text style={styles.legendLabel}>{b.label}</Text>
                <Text style={styles.legendValue}>{b.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Roadmap                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.roadmap.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.roadmap.eyebrow} title={t.roadmap.title} />

        <RoadmapTimeline
          phases={ROADMAP_PHASES.map((p) => ({
            period: p.period,
            title: t.roadmap.phases[p.key].title,
          }))}
        />

        <View style={{ marginTop: 18 }}>
          {ROADMAP_PHASES.map((p, idx) => {
            const phase = t.roadmap.phases[p.key];
            return (
              <View
                key={p.key}
                style={{
                  flexDirection: "row",
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottomWidth: idx === ROADMAP_PHASES.length - 1 ? 0 : 1,
                  borderBottomColor: color.borderSoft,
                }}
              >
                <View style={{ width: 90 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: PIE_COLORS[idx % PIE_COLORS.length] }}>
                    {p.period}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10.5, fontFamily: "Helvetica-Bold", color: color.white, marginBottom: 3 }}>
                    {phase.title}
                  </Text>
                  <Text style={{ fontSize: 9, color: color.muted, lineHeight: 1.5 }}>{phase.body}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Global Expansion                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.globalization.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.globalization.eyebrow} title={t.globalization.title} />
        {t.globalization.paragraphs.map((p: string, idx: number) => (
          <Text key={idx} style={styles.paragraph}>
            {p}
          </Text>
        ))}
        <Text style={styles.h2}>{t.globalization.tiersTitle}</Text>
        <View style={styles.grid2}>
          {t.globalization.tiers.map((tier: any, idx: number) => (
            <InfoCard key={idx} title={tier.title} body={tier.body} half />
          ))}
        </View>
      </Page>

      {/* ---------------------------------------------------------------- */}
      {/* Contact                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Page size="A4" style={styles.page}>
        <PageFrame section={t.contact.section} logoMark={logoMark} brand={t.footerBrand} />
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} />
        <Text style={styles.intro}>{t.contact.intro}</Text>

        <View style={styles.table}>
          {t.contact.channels.map((c: any, idx: number) => {
            const isLast = idx === t.contact.channels.length - 1;
            return (
              <View key={idx} style={isLast ? styles.tRowLast : styles.tRow}>
                <Text style={[styles.tCell, { width: "40%", fontFamily: "Helvetica-Bold" }]}>{c.label}</Text>
                <Text style={[styles.tCell, { width: "60%", color: color.accent }]}>{c.value}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 24, padding: 12, borderWidth: 1, borderColor: color.borderSoft, borderRadius: 4, backgroundColor: color.panel }}>
          <Text style={{ fontSize: 7.8, color: color.mutedSoft, lineHeight: 1.5 }}>{t.contact.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
};
