import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Consensus",
  description:
    "Trayon's modified PBFT consensus: round timing, BLS signature aggregation, quorum requirements, and slashing conditions.",
};

export default function ConsensusPage() {
  return (
    <DocsShell currentHref="/docs/consensus">
      <h1>Consensus</h1>
      <p>
        Trayon uses a modified Practical Byzantine Fault Tolerance (PBFT)
        protocol, requiring a 2/3 + 1 quorum among 1,000+ staked validators,
        with BLS signature aggregation for compact, efficient proofs of
        agreement.
      </p>

      <h2 id="consensus-round">Consensus round (12 seconds)</h2>
      <pre>
        <code>{`T+0s   Block Proposal
       Sequencer proposes a batch (txs, state root, timestamp)
       and broadcasts it to all validators.

T+4s   Validation Phase
       Validators independently execute the batch, compute a
       local state root, and vote APPROVE / REJECT.

T+8s   Quorum Check
       Sequencer collects votes, requires 2/3 + 1 validators,
       aggregates signatures with BLS, and broadcasts commit.

T+12s  Finality
       Block is finalized. State update becomes immutable.
       Validator reputations are updated.`}</code>
      </pre>

      <h2 id="bls-aggregation">BLS signature aggregation</h2>
      <p>
        Rather than storing every individual validator signature on-chain,
        Trayon aggregates BLS signatures into a single 48-byte proof —
        regardless of how many validators signed. This keeps on-chain
        verification cheap while still cryptographically proving that a
        2/3 + 1 quorum approved the block.
      </p>

      <h2 id="slashing">Slashing conditions</h2>
      <table>
        <thead>
          <tr>
            <th>Condition</th>
            <th>Penalty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Voted REJECT on a block that was ultimately approved</td>
            <td>-5% of stake (false positive)</td>
          </tr>
          <tr>
            <td>Did not vote within the round window</td>
            <td>-10% of stake (downtime)</td>
          </tr>
          <tr>
            <td>Double-signed conflicting blocks</td>
            <td>-100% of stake (Byzantine slash)</td>
          </tr>
          <tr>
            <td>Committed provably false data</td>
            <td>-50% of stake (data integrity slash)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Slashed TRAY is burned rather than redistributed, reinforcing the
        network&apos;s deflationary token model. See{" "}
        <a href="/docs/tokenomics">TRAY Tokenomics</a> for details.
      </p>

      <h2 id="reputation">Validator reputation</h2>
      <p>
        Each validator carries a reputation score (0–100) that increases
        with consistent, correct participation and decreases after
        slashing events. Reputation influences validator selection weight
        in future rounds but does not replace stake-based security.
      </p>
    </DocsShell>
  );
}
