import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "TRAY Tokenomics",
  description:
    "TRAY token supply, distribution, staking requirements, fee burn mechanics, and governance model.",
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
          <strong>Governance</strong> — protocol parameters are governed
          through quadratic voting, where vote cost scales with the square
          of voting power to reduce whale dominance.
        </li>
      </ul>

      <h2 id="deflation">Fee burn &amp; deflation</h2>
      <p>
        20% of all gas fees collected by the network are permanently
        burned via <code>TrayonToken.burn()</code>. Slashed stake is also
        burned rather than redistributed. This creates deflationary
        pressure that scales with actual network usage.
      </p>
      <pre>
        <code>{`getDeflationPercentage() = (TOTAL_SUPPLY - totalSupply()) / TOTAL_SUPPLY * 100`}</code>
      </pre>

      <h2 id="staking-rewards">Staking rewards</h2>
      <p>
        Validators earn block rewards for honest participation, in
        addition to a share of network fees. Rewards accrue continuously
        and are reduced proportionally to any active slashing penalties.
        See <a href="/docs/validators">Running a Validator</a> for setup
        and expected yield ranges.
      </p>
    </DocsShell>
  );
}
