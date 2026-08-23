import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import {
  SupplyDistributionChart,
  EmissionTimelineChart,
  FeeBurnProjectionChart,
} from "@/components/docs/charts";

export const metadata: Metadata = {
  title: "TRAY Tokenomics",
  description:
    "TRAY token supply, distribution, staking requirements, fee burn mechanics, real-world use cases, and governance model.",
};

export default function TokenomicsPage() {
  return (
    <DocsShell currentHref="/docs/tokenomics">
      <h1>TRAY Tokenomics</h1>
      <p>
        TRAY is the native token securing the Trayon network. It is
        designed as infrastructure cost, not speculation, with a fixed
        total supply and utility tied directly to network usage.
      </p>

      <h2 id="supply">Supply</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Token standard</td>
            <td>ERC-20 (L1) + native gas token (L2)</td>
          </tr>
          <tr>
            <td>Total supply</td>
            <td>1,000,000,000 TRAY</td>
          </tr>
          <tr>
            <td>Initial circulating supply</td>
            <td>250,000,000 TRAY (25%)</td>
          </tr>
          <tr>
            <td>Decimals</td>
            <td>18</td>
          </tr>
        </tbody>
      </table>

      <SupplyDistributionChart />

      <h3 id="allocation-breakdown">Initial allocation breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Initial Launch (IDO/Private)</td>
            <td>250M (25%)</td>
            <td>100M private round · 100M public sale · 50M liquidity pools</td>
          </tr>
          <tr>
            <td>DAO Treasury</td>
            <td>250M (25%)</td>
            <td>Future development, growth incentives, emergency fund</td>
          </tr>
          <tr>
            <td>Validators &amp; Operators</td>
            <td>200M (20%)</td>
            <td>100M rewards (years 1–5) · 50M initial incentives · 50M security fund</td>
          </tr>
          <tr>
            <td>Development Team</td>
            <td>150M (15%)</td>
            <td>50M founders · 50M engineering · 50M research &amp; security (4-yr vesting)</td>
          </tr>
          <tr>
            <td>Partnerships &amp; Integrations</td>
            <td>100M (10%)</td>
            <td>50M exchanges/market makers · 25M API integrations · 25M gov/corporate</td>
          </tr>
          <tr>
            <td>Strategic Reserve</td>
            <td>50M (5%)</td>
            <td>Emergency volatility buffer, security forks, extraordinary DAO decisions</td>
          </tr>
        </tbody>
      </table>

      <h3 id="unlock-schedule">Unlock schedule (2026–2031)</h3>
      <EmissionTimelineChart />

      <h2 id="utility">Utility</h2>
      <ul>
        <li>
          <strong>Gas</strong> — TRAY is the native gas token for every
          Layer 2 transaction; there is no need to hold ETH to interact
          with the network.
        </li>
        <li>
          <strong>Staking</strong> — running a validator requires a minimum
          stake of 32,000 TRAY, locked and subject to slashing.
        </li>
        <li>
          <strong>Data marketplace access</strong> — enterprises and
          government agencies spend TRAY to query audited datasets and
          analytical reports (see <a href="#use-cases">Real-world use
          cases</a> below).
        </li>
        <li>
          <strong>Governance</strong> — protocol parameters are governed
          through quadratic voting, where vote cost scales with the square
          of voting power to reduce whale dominance.
        </li>
      </ul>

      <h2 id="use-cases">Real-world use cases</h2>
      <p>
        Beyond gas and staking, TRAY is consumed directly by enterprises
        and governments paying for verified data access — this is the
        demand side that drives the fee-burn engine described below.
      </p>

      <h3 id="use-case-corporate">Corporate balance-sheet queries</h3>
      <pre>
        <code>{`Price:      1,000 TRAY per access
Frequency:  Monthly
Annual cost: 12,000 TRAY per subscribing company
Impact:      Continuous, predictable demand`}</code>
      </pre>

      <h3 id="use-case-government">Government procurement audits</h3>
      <pre>
        <code>{`Price:      50,000 TRAY per full audit
Frequency:  On demand
Example:    1,000 audits/year → 50M TRAY in query volume
Impact:      Large, discrete burn events`}</code>
      </pre>

      <h3 id="use-case-predictive">Predictive analytics reports</h3>
      <pre>
        <code>{`Price:      5,000 TRAY per report
Frequency:  Weekly
Subscribers: 100 companies → 26M TRAY/year
Impact:      Recurring revenue for the data marketplace`}</code>
      </pre>

      <h2 id="deflation">Fee burn &amp; deflation</h2>
      <p>
        Every transaction fee is split three ways: <strong>70%</strong> to
        validators (rewards), <strong>20%</strong> permanently burned via{" "}
        <code>TrayonToken.burn()</code>, and <strong>10%</strong> to the
        DAO treasury. Slashed stake is also burned rather than
        redistributed. This creates deflationary pressure that scales with
        actual network usage rather than speculative activity.
      </p>
      <pre>
        <code>{`getDeflationPercentage() = (TOTAL_SUPPLY - totalSupply()) / TOTAL_SUPPLY * 100`}</code>
      </pre>

      <FeeBurnProjectionChart />

      <h2 id="staking-rewards">Staking rewards</h2>
      <p>
        Validators earn block rewards for honest participation, in
        addition to a share of network fees. Rewards accrue continuously
        and are reduced proportionally to any active slashing penalties.
        See <a href="/docs/validators">Running a Validator</a> for setup
        and expected yield ranges, and{" "}
        <a href="/docs/economic-projections">Economic Projections</a> for
        conservative/base/optimistic demand scenarios through 2031.
      </p>
    </DocsShell>
  );
}
