import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Layer 2 Architecture",
  description:
    "How the Trayon Layer 2 is structured: application layer, smart contracts, sequencer, validator nodes, and ZK settlement to Ethereum via Polygon CDK.",
};

export default function ArchitecturePage() {
  return (
    <DocsShell currentHref="/docs/architecture">
      <h1>Layer 2 Architecture</h1>
      <p>
        Trayon is a decentralized Layer 2 built with Polygon CDK (Chain
        Development Kit), optimized for high-availability data capture and
        validation, real-time AI oracle processing, and low-cost
        transactions secured by Ethereum through ZK-proofs.
      </p>

      <h2 id="layered-stack">The layered stack</h2>
      <p>The protocol is organized into four layers, top to bottom:</p>
      <pre>
        <code>{`┌─────────────────────────────────────────────────┐
│  Application Layer                              │
│  GovTech · Corporate · Judicial · Markets       │
└────────────────┬────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Trayon Smart Contracts (Solidity)               │
│  Oracle Manager · Validator Registry · TRAY      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Trayon Layer 2 (Polygon CDK)                    │
│  Sequencer · EVM State Machine · AI Consensus    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  ZK-Proving & Data Availability                  │
│  ZK-SNARK Proofs · Batches to Ethereum/Polygon   │
└─────────────────────────────────────────────────┘`}</code>
      </pre>

      <h2 id="sequencer">Sequencer node</h2>
      <p>
        The sequencer orders incoming transactions, builds batches (capped
        at 2,000 transactions per batch), computes the resulting state
        root, and coordinates the consensus round with validators before
        finalizing a block.
      </p>
      <pre>
        <code>{`Mempool Manager → Block Producer → Consensus Coordinator → Settlement & ZK Proving
   (order, fee)     (batch, root)     (broadcast, quorum)     (proof, L1 batch)`}</code>
      </pre>

      <h2 id="validator-node">Validator node</h2>
      <p>
        Each validator runs an EVM-compatible state machine, a consensus
        handler, a stake manager with slashing logic, and an AI processing
        pipeline that independently verifies proposed data before signing
        off with a BLS partial signature.
      </p>

      <h2 id="settlement">Settlement to Ethereum</h2>
      <p>
        Batches are proven with ZK-SNARKs and submitted to Ethereum L1
        through Polygon CDK, inheriting Ethereum&apos;s security guarantees
        while keeping transaction costs low and throughput high on Layer 2.
      </p>

      <div className="docs-callout">
        See <a href="/docs/consensus">Consensus</a> for the full round
        timing and slashing conditions, and{" "}
        <a href="/docs/oracle-ai">Oracle &amp; AI Validation</a> for how
        data is verified before it reaches the sequencer.
      </div>
    </DocsShell>
  );
}
