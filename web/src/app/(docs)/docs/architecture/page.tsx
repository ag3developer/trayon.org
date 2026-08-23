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

      <h2 id="gas-token">TRAY as the native gas token</h2>
      <p>
        TRAY completely replaces ETH as the gas currency inside the
        Trayon Layer 2. Every transaction — a validated data submission,
        an oracle query, a governance vote — is metered and paid in TRAY:
      </p>
      <pre>
        <code>{`Transaction on Trayon L2:
  gasPrice = 10 wei (TRAY)
  gasLimit = 21,000
  fee      = 210,000 TRAY (paid entirely in TRAY, no ETH required)`}</code>
      </pre>
      <p>
        This removes the friction of holding a separate gas asset — a
        government agency or auditing firm can transact on Trayon without
        ever touching ETH — and ties gas demand directly to TRAY&apos;s
        deflationary fee-burn mechanics (see{" "}
        <a href="/docs/tokenomics#deflation">Fee burn &amp; deflation</a>).
      </p>
      <pre>
        <code>{`// Simplified custom gas token settlement (Polygon CDK)
contract GasToken is ERC20 {
    address public sequencer;

    function payGas(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "insufficient TRAY");
        burn(amount);
        emit GasConsumed(msg.sender, amount);
    }
}`}</code>
      </pre>

      <h2 id="validator-internals">Validator node internals</h2>
      <p>
        A full validator is more than a single process — it combines
        state sync, stake management, and AI-assisted verification into
        one node:
      </p>
      <pre>
        <code>{`Trayon Validator Node
├── Full Node (State Sync)
│   ├─ Ethereum light client
│   ├─ Full Trayon L2 state
│   └─ Oracle data cache
│
├── Validator Manager
│   ├─ Stake monitor (32,000+ TRAY locked)
│   ├─ Reputation score (0–100)
│   └─ Slashing detector
│
├── AI Consensus Module
│   ├─ Data ingestion agent
│   ├─ Validation algorithm
│   └─ Threshold Signature Scheme (BLS/TSS)
│
└── RPC Interface
    ├─ JSON-RPC 2.0
    ├─ WebSocket subscriptions
    └─ Archive mode support`}</code>
      </pre>

      <h3 id="validator-hardware">Recommended hardware</h3>
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Recommended</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CPU</td>
            <td>16-core (8-core minimum — see <a href="/docs/validators">Running a Validator</a>)</td>
          </tr>
          <tr>
            <td>RAM</td>
            <td>32 GB</td>
          </tr>
          <tr>
            <td>Storage</td>
            <td>500 GB+ SSD (1 TB NVMe recommended for archive mode)</td>
          </tr>
          <tr>
            <td>Network</td>
            <td>99%+ uptime, &lt;100ms latency to peers</td>
          </tr>
        </tbody>
      </table>

      <h3 id="validation-lifecycle">End-to-end validation lifecycle</h3>
      <pre>
        <code>{`1. Data ingestion
   AI agents capture data from official APIs (JSON, CSV, HTTP)

2. Consensus phase
   Each validator independently executes the verification algorithm;
   Threshold Signature Scheme requires 2/3+1 agreement; 12s block timeout

3. Commit to blockchain
   Merkle root of validated data + aggregated BLS signature,
   stored via the TrayonOracle smart contract

4. ZK-proof generation
   Sequencer batches state transitions and proves them with a
   ZK-SNARK before submitting to Ethereum L1 via Polygon CDK`}</code>
      </pre>

      <div className="docs-callout">
        See <a href="/docs/consensus">Consensus</a> for the full round
        timing and slashing conditions, and{" "}
        <a href="/docs/oracle-ai">Oracle &amp; AI Validation</a> for how
        data is verified before it reaches the sequencer.
      </div>
    </DocsShell>
  );
}
