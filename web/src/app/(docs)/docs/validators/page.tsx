import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Running a Validator",
  description:
    "Hardware requirements, setup steps, staking, and reward mechanics for running a Trayon validator node.",
};

export default function ValidatorsPage() {
  return (
    <DocsShell currentHref="/docs/validators">
      <h1>Running a Validator</h1>
      <p>
        Validators are the backbone of Trayon&apos;s security model. They
        independently re-execute proposed batches, verify AI-submitted
        data, and vote under the consensus protocol described in{" "}
        <a href="/docs/consensus">Consensus</a>.
      </p>

      <h2 id="requirements">Minimum requirements</h2>
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Minimum</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CPU</td>
            <td>8 cores</td>
          </tr>
          <tr>
            <td>RAM</td>
            <td>32 GB</td>
          </tr>
          <tr>
            <td>Storage</td>
            <td>1 TB NVMe SSD</td>
          </tr>
          <tr>
            <td>Network</td>
            <td>100 Mbps symmetric, low-latency</td>
          </tr>
          <tr>
            <td>Stake</td>
            <td>32,000 TRAY minimum</td>
          </tr>
        </tbody>
      </table>

      <h2 id="setup">Setup overview</h2>
      <pre>
        <code>{`1. Install the Trayon validator client
2. Generate a validator key pair (BLS)
3. Acquire and lock 32,000+ TRAY via ValidatorRegistry.registerValidator()
4. Sync the node to the current network state
5. Start the validator process and confirm it appears as active
   in GET /v1/validators`}</code>
      </pre>

      <h2 id="responsibilities">Responsibilities</h2>
      <ul>
        <li>Maintain high uptime — missed votes are penalized (-10% stake).</li>
        <li>
          Independently verify batches rather than blindly trusting the
          sequencer&apos;s proposed state root.
        </li>
        <li>
          Keep signing keys secure — Byzantine behavior (double-signing)
          results in a full stake slash.
        </li>
      </ul>

      <h2 id="rewards">Rewards</h2>
      <p>
        Validators earn a share of network fees and block rewards
        proportional to stake and reputation. Reputation is tracked
        on-chain via <code>ValidatorRegistry.updateReputation()</code> and
        influences long-term reward weighting. See{" "}
        <a href="/docs/tokenomics">TRAY Tokenomics</a> for the full fee and
        burn model.
      </p>

      <div className="docs-callout">
        Validator client binaries, Docker images, and Ansible playbooks
        will be published alongside the public testnet launch (Q3–Q4
        2026). See the <a href="/whitepaper">roadmap</a> for milestones.
      </div>
    </DocsShell>
  );
}
