import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "Trayon Protocol documentation — a global infrastructure for real-time data integrity combining Layer 2 blockchain settlement with decentralized AI validation.",
};

export default function DocsIntroductionPage() {
  return (
    <DocsShell currentHref="/docs">
      <h1>Introduction</h1>
      <p>
        Trayon is a decentralized infrastructure for real-time data
        integrity. It combines a Layer 2 blockchain, built with Polygon CDK,
        with a network of decentralized AI validators that verify critical
        data, detect fraud, and stop manipulation before it spreads across
        government, financial, legal, and market systems.
      </p>
      <p>
        This documentation describes the protocol at an engineering level:
        how data moves through the network, how consensus is reached, how
        the AI validation layer works, how the TRAY token secures the
        network, and how to run a validator node or integrate with the
        Trayon API.
      </p>

      <h2 id="why-trayon">Why Trayon</h2>
      <p>
        Institutions rely on centralized reporting pipelines — budgets,
        audits, market feeds, legal records — that surface long after the
        underlying event occurred, with no cryptographic way to prove the
        data wasn&apos;t altered. Trayon replaces single-source reporting
        with a two-layer verification model:
      </p>
      <ul>
        <li>
          <strong>AI ensemble validation</strong> — multiple independent
          machine learning models must reach statistical agreement before a
          data point is proposed to the network.
        </li>
        <li>
          <strong>Decentralized consensus</strong> — a modified PBFT
          consensus among staked validators confirms the result and commits
          a cryptographic proof on-chain.
        </li>
      </ul>
      <p>
        The result is data that is auditable by anyone and alterable by no
        one — without relying on a single trusted intermediary.
      </p>

      <h2 id="how-the-docs-are-organized">How this documentation is organized</h2>
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Covers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Layer 2 Architecture</td>
            <td>Network layers, sequencer, ZK settlement to Ethereum</td>
          </tr>
          <tr>
            <td>Consensus</td>
            <td>Modified PBFT, BLS signature aggregation, slashing</td>
          </tr>
          <tr>
            <td>Oracle &amp; AI Validation</td>
            <td>Data ingestion pipeline, AI ensemble, validator voting</td>
          </tr>
          <tr>
            <td>Smart Contracts</td>
            <td>TrayonToken, ValidatorRegistry, TrayonOracle reference</td>
          </tr>
          <tr>
            <td>API Reference</td>
            <td>REST endpoints for querying committed data and validators</td>
          </tr>
          <tr>
            <td>TRAY Tokenomics</td>
            <td>Supply, staking, fee burn, governance</td>
          </tr>
          <tr>
            <td>Running a Validator</td>
            <td>Hardware requirements, setup, staking, rewards</td>
          </tr>
        </tbody>
      </table>

      <h2 id="protocol-status">Protocol status</h2>
      <p>
        Trayon is currently in active development. Testnet and MVP work is
        targeted for Q3–Q4 2026, with a mainnet beta alongside pilot
        partners planned for Q1–Q2 2027. See the{" "}
        <a href="/whitepaper">whitepaper</a> for the full roadmap and
        globalization strategy.
      </p>

      <div className="docs-callout">
        <strong>Looking for the business case?</strong> The{" "}
        <a href="/whitepaper">Trayon Whitepaper</a> covers the mission,
        market opportunity, and expansion strategy. This documentation
        focuses on protocol internals and integration for engineers.
      </div>
    </DocsShell>
  );
}
