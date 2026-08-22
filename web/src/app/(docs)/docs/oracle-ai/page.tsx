import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Oracle & AI Validation",
  description:
    "How Trayon ingests data from independent sources, runs it through an AI ensemble, and reaches validator consensus before committing it on-chain.",
};

export default function OracleAiPage() {
  return (
    <DocsShell currentHref="/docs/oracle-ai">
      <h1>Oracle &amp; AI Validation</h1>
      <p>
        The Trayon Oracle is a decentralized network of AI agents that
        capture data from primary sources, process it through machine
        learning models, and submit it for validator consensus before it
        is committed on-chain. The guiding principle is{" "}
        <strong>Zero Trust Data</strong>: no single source is ever trusted
        by default.
      </p>

      <h2 id="pipeline">Data pipeline</h2>
      <pre>
        <code>{`Data Sources (official APIs, transparency portals, market feeds)
        │
        ▼
AI Data Ingestion Layer
   ├─ Web scrapers / API connectors
   ├─ Schema & checksum validation
   └─ Statistical anomaly detection
        │
        ▼
AI Processing & Feature Engineering
   ├─ NLP (text and context analysis)
   ├─ Time series analysis
   ├─ Fraud detection models
   └─ Predictive / forecasting models
        │
        ▼
Consensus & Validation Layer
   ├─ Validator nodes (2/3+1 honest majority)
   ├─ BLS threshold signing
   └─ Reputation scoring & slashing detection
        │
        ▼
Blockchain Settlement (Merkle root commitment)`}</code>
      </pre>

      <h2 id="ai-ensemble">AI ensemble agreement</h2>
      <p>
        Each data point is scored by an ensemble of independent models —
        typically combining an Isolation Forest and Gradient Boosting
        classifier for fraud detection, alongside an LSTM/ARIMA model for
        time series forecasting. A value is only proposed to the network
        once the ensemble reaches statistical agreement, reducing the risk
        that a single flawed model introduces bad data.
      </p>

      <h2 id="two-layer-integrity">Why two layers of verification</h2>
      <p>
        AI ensemble agreement alone is not enough — models can share blind
        spots. Decentralized validator consensus alone is also not enough —
        validators can only check what they receive. Combining both layers
        means:
      </p>
      <ul>
        <li>
          The AI layer catches statistical anomalies and known fraud
          patterns before data ever reaches consensus.
        </li>
        <li>
          The validator layer independently re-executes and cross-checks
          proposed data against a 2/3+1 quorum requirement.
        </li>
      </ul>
      <p>
        This is what allows Trayon to flag manipulation in real time,
        rather than discovering it in a retrospective audit months later.
      </p>

      <h2 id="commitment">On-chain commitment</h2>
      <p>
        Once validated, data is committed as a Merkle root with an
        aggregated BLS signature via the <code>TrayonOracle</code>{" "}
        contract. See <a href="/docs/smart-contracts">Smart Contracts</a>{" "}
        for the interface reference.
      </p>
    </DocsShell>
  );
}
