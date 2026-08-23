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

      <h2 id="staking-mechanics">Staking mechanics</h2>
      <p>
        Locking TRAY as a validator serves three purposes: earning block
        rewards (~8% APY), collecting a share of data-query fees, and
        gaining voting weight in DAO governance.
      </p>
      <pre>
        <code>{`Validator stake model
  Initial stake:   32,000 TRAY (minimum)
  Annual rewards:  ~2,560 TRAY (≈8% APY)
  Lock period:     3–12 months, variable by commitment tier
  Unstake delay:   3 days (security window against rapid exits)`}</code>
      </pre>
      <p>
        A worked slashing example — a validator caught submitting
        provably false data loses 50% of stake:
      </p>
      <pre>
        <code>{`Validator stake:  32,000 TRAY
Infraction:       False data (data integrity slash)
Slashing rate:    50%
Penalty:          16,000 TRAY burned
Remaining stake:  16,000 TRAY
Result:           Removed from the active set (below 32,000 minimum)`}</code>
      </pre>

      <h2 id="zk-settlement">ZK-proof generation &amp; L1 settlement</h2>
      <p>
        Once a batch is finalized on Layer 2, the sequencer generates a
        succinct ZK-SNARK proof attesting that the state transition is
        valid, then submits it to a settlement contract on Ethereum L1:
      </p>
      <pre>
        <code>{`Trayon L2 block
├─ State root (Merkle)
├─ Transaction batch
├─ Data commitments
└─ Validator signatures (BLS-aggregated)
      │
      ▼
ZK-Prover (off-chain)
├─ Generates SNARK circuit
├─ Proves "valid state transition"
├─ ~5–10 minutes per batch
└─ Output: π proof (288 bytes)
      │
      ▼
Settlement contract (Ethereum L1)
├─ Verifies π proof in ~200ms
├─ Updates the L1 merkle root
└─ Emits StateCommitted event`}</code>
      </pre>
      <pre>
        <code>{`// Ethereum L1 settlement contract (simplified)
contract TrayonSettlement {
    bytes32 public latestStateRoot;
    uint256 public batchHeight;

    function submitBatch(
        bytes32 stateRoot,
        bytes calldata zkProof,
        uint256 height
    ) external {
        require(msg.sender == sequencer, "unauthorized");
        require(verifyZKProof(zkProof, stateRoot), "invalid proof");

        latestStateRoot = stateRoot;
        batchHeight = height;
        emit BatchSettled(height, stateRoot);
    }
}`}</code>
      </pre>

      <h3 id="settlement-schedule">Settlement schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Batch size</td>
            <td>Up to 2,000 transactions</td>
          </tr>
          <tr>
            <td>Submission interval</td>
            <td>Every 2 hours, or when a batch fills</td>
          </tr>
          <tr>
            <td>L1 finality</td>
            <td>~30 minutes after Ethereum confirmation</td>
          </tr>
          <tr>
            <td>Cost per batch</td>
            <td>~$50–200, shared across all transactions in the batch</td>
          </tr>
        </tbody>
      </table>
      <p>
        Once finalized on L1, a batch is irreversible — this is the point
        at which Trayon&apos;s data commitments inherit Ethereum&apos;s
        full security guarantees.
      </p>
    </DocsShell>
  );
}
