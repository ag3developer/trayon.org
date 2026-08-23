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

      <h2 id="model-ensemble">The AI model ensemble, in detail</h2>
      <p>
        Different data domains call for different model types. Trayon
        runs a small set of specialized models per data category rather
        than one general-purpose model:
      </p>

      <h3 id="model-fraud">Fraud detection</h3>
      <pre>
        <code>{`Input:   Financial data, transaction history
Output:  Fraud probability score (0–100)
Model:   Isolation Forest + Gradient Boosting
Accuracy: 94–96%

Example:
  R$1M transaction from a historically small account
  → Fraud score: 87%
  → Requires manual sign-off from 2 validators
  → If approved, committed on-chain; if not, discarded`}</code>
      </pre>

      <h3 id="model-nlp">NLP &amp; sentiment analysis</h3>
      <pre>
        <code>{`Input:   News text, judicial decisions, official statements
Output:  Sentiment (bullish/bearish) + extracted entities
Model:   Transformer-based (BERT/GPT-class)

Example:
  Headline: "Government announces new import tariff"
  → Sentiment: bearish (82% confidence)
  → Entities: [Government, Tariff, Imports]
  → Downstream signal: -3–5% expected on exporter equities`}</code>
      </pre>

      <h3 id="model-forecasting">Time-series forecasting</h3>
      <pre>
        <code>{`Input:   30–90 days of historical price/value data
Output:  24-hour forecast with confidence interval
Model:   LSTM + Prophet
Accuracy: 72–78%

Example:
  USD/BRL history: [5.20, 5.18, 5.22, 5.19, ...]
  → 24h forecast: 5.21 (range 5.19–5.23)
  → Confidence: 74%
  → Validators vote on whether the forecast is admissible`}</code>
      </pre>

      <h3 id="model-manipulation">Market manipulation detection</h3>
      <pre>
        <code>{`Input:   Volume, price, and wallet-concentration data
Output:  Manipulation score (0–100)
Model:   Anomaly detection + graph analysis
Detects: Pump-and-dump patterns, wash trading, whale coordination`}</code>
      </pre>

      <h2 id="case-study">Case study: government procurement audit</h2>
      <p>
        A concrete walkthrough of the full pipeline, end to end, for a
        government procurement dataset:
      </p>
      <pre>
        <code>{`1. Ingestion
   Trayon pulls the public procurement portal feed (bid amounts,
   winning vendor, contract value) alongside the Treasury's
   published budget execution data for the same period.

2. Cross-source validation
   The two independent sources are diffed; if the procurement
   amount and the budget execution entry disagree by more than a
   configured tolerance, the entry is flagged for anomaly review.

3. AI ensemble scoring
   The fraud-detection model scores the flagged entry (e.g. a
   contract awarded 40% above the median for comparable bids
   scores 91/100 for fraud risk).

4. Validator consensus
   High-risk entries require an explicit 2/3+1 validator quorum
   vote rather than default auto-approval; validators can pull the
   underlying source documents via the same ingestion connectors.

5. On-chain commitment
   Approved entries are committed as a Merkle root via
   TrayonOracle.commitData(), with the AI risk score and validator
   vote tally stored alongside the data for future audits.

6. Query & billing
   Government auditors or journalists query the committed record
   through the data marketplace (50,000 TRAY per full audit — see
   TRAY Tokenomics), with the query fee split 70/20/10 across
   validators, burn, and treasury.`}</code>
      </pre>
      <p>
        This is what "detect manipulation in real time" means concretely:
        the discrepancy is flagged during ingestion — before settlement —
        rather than surfacing months later in a retrospective audit.
      </p>

      <h2 id="data-sources">Sources by sector</h2>
      <p>
        Each vertical draws from multiple independent sources so no single
        feed can unilaterally determine a committed value:
      </p>
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>Example sources</th>
            <th>Validation approach</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Government &amp; macro</td>
            <td>Central bank, statistics agencies, treasury portals</td>
            <td>Cross-source agreement across 3+ feeds</td>
          </tr>
          <tr>
            <td>Corporate &amp; accounting</td>
            <td>Regulator filings, exchange disclosures</td>
            <td>XBRL parsing + prior-audit cross-check</td>
          </tr>
          <tr>
            <td>Markets &amp; finance</td>
            <td>CEX/DEX order books, liquidity aggregators</td>
            <td>Consensus across 5+ price feeds, depth verification</td>
          </tr>
          <tr>
            <td>Judicial &amp; legal</td>
            <td>Court decision portals, official gazettes</td>
            <td>Digital certificate verification + NLP parsing</td>
          </tr>
        </tbody>
      </table>
    </DocsShell>
  );
}
