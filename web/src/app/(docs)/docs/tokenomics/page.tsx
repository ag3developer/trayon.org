import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { SupplyDistributionChart } from "@/components/docs/charts";
import { SNAPSHOT_DATE, TRAY_ALLOCATION, TRAY_TOKEN, shortAddress } from "@/lib/token";

export const metadata: Metadata = {
  title: "TRAY Tokenomics",
  description:
    "TRAY token supply (21,000,000 hard cap), official contract on Polygon, on-chain distribution, planned utility, and migration to the native Trayon chain.",
};

const CATEGORY_DETAIL: Record<string, string> = {
  treasury: "Project treasury: funding development, listings, and the public sale",
  staking: "Rewards pool for TRAY staking plans",
  liquidity: "Reserved for DEX liquidity (TRAY/USDT)",
  timelock: "Reserve released only through time-delayed proposals",
  vesting: "Locked allocations released on a vesting schedule",
  ecosystem: "Partnerships, integrations, and community distribution",
  referral: "Legacy referral registry; it has no function to move tokens, so this balance is effectively out of circulation",
  circulating: "Held by community wallets",
};

export default function TokenomicsPage() {
  return (
    <DocsShell currentHref="/docs/tokenomics">
      <h1>TRAY Tokenomics</h1>
      <p>
        TRAY is the token of the Trayon network. Today it is an ERC-20 on
        Polygon PoS with a hard cap of <strong>21,000,000 TRAY</strong>,
        enforced by the token contract itself. When the Trayon chain
        launches, TRAY is planned to become its native gas and staking
        token through a 1:1 migration.
      </p>

      <h2 id="official-contract">Official contract</h2>
      <table>
        <tbody>
          <tr>
            <td>Address</td>
            <td>
              <a href={TRAY_TOKEN.explorerUrl} target="_blank" rel="noopener noreferrer">
                <code>{TRAY_TOKEN.address}</code>
              </a>
            </td>
          </tr>
          <tr>
            <td>Network</td>
            <td>{TRAY_TOKEN.network} (chain ID {TRAY_TOKEN.chainId})</td>
          </tr>
          <tr>
            <td>Name / symbol</td>
            <td>
              {TRAY_TOKEN.name} / {TRAY_TOKEN.symbol}
            </td>
          </tr>
          <tr>
            <td>Decimals</td>
            <td>{TRAY_TOKEN.decimals}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>This is the only official TRAY contract.</strong> Other
        tokens using the TRAY name — including versions with a
        1,000,000,000 supply — are not official. Always check the address
        before buying or receiving TRAY.
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
            <td>ERC-20 on Polygon PoS today · native gas token on the Trayon chain (planned, 1:1 migration)</td>
          </tr>
          <tr>
            <td>Total supply</td>
            <td>21,000,000 TRAY (hard cap — <code>MAX_SUPPLY</code> in the contract)</td>
          </tr>
          <tr>
            <td>Minting</td>
            <td>
              Permanently disabled — <code>finalize()</code> was called on{" "}
              {TRAY_TOKEN.finalizedDate} (
              <a href={TRAY_TOKEN.finalizedTx} target="_blank" rel="noopener noreferrer">
                transaction
              </a>
              ). No new TRAY can ever be created.
            </td>
          </tr>
          <tr>
            <td>Decimals</td>
            <td>18</td>
          </tr>
        </tbody>
      </table>

      <SupplyDistributionChart />

      <h3 id="allocation-breakdown">Distribution breakdown</h3>
      <p>
        Balances read directly from the blockchain on {SNAPSHOT_DATE}. Each
        category is held by its own contract, so anyone can verify it on
        Polygonscan.
      </p>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Held by</th>
          </tr>
        </thead>
        <tbody>
          {TRAY_ALLOCATION.map((row) => (
            <tr key={row.key}>
              <td>
                {row.name}
                <br />
                <small>{CATEGORY_DETAIL[row.key]}</small>
              </td>
              <td>
                {row.amount.toLocaleString("en-US")} ({row.pct}%)
              </td>
              <td>
                {row.holder ? (
                  <a href={`https://polygonscan.com/address/${row.holder}`} target="_blank" rel="noopener noreferrer">
                    <code>{shortAddress(row.holder)}</code>
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        A detailed release and vesting schedule for these allocations will
        be published before the public sale.
      </p>

      <h2 id="utility">Utility</h2>
      <p>
        The utilities below describe TRAY on the Trayon chain. They are{" "}
        <strong>planned</strong> and become active as each part of the
        network launches.
      </p>
      <ul>
        <li>
          <strong>Gas (planned)</strong> — TRAY will be the native gas token
          for every transaction on the Trayon chain; there will be no need to
          hold another asset to interact with the network.
        </li>
        <li>
          <strong>Validator staking (planned)</strong> — running a validator
          will require a minimum stake of 32,000 TRAY, locked and subject to
          slashing.
        </li>
        <li>
          <strong>Data marketplace access (planned)</strong> — enterprises
          and government agencies will spend TRAY to query audited datasets
          and analytical reports.
        </li>
        <li>
          <strong>Governance (planned)</strong> — protocol parameters will
          be governed through quadratic voting, where vote cost scales with
          the square of voting power to reduce whale dominance.
        </li>
      </ul>

      <h2 id="use-cases">Real-world use cases</h2>
      <p>
        Beyond gas and staking, TRAY is designed to be consumed directly by
        enterprises and governments paying for verified data access. Prices
        will be set when the data marketplace launches.
      </p>
      <ul>
        <li>
          <strong>Corporate balance-sheet queries</strong> — recurring
          monthly access to verified financial data.
        </li>
        <li>
          <strong>Government procurement audits</strong> — on-demand full
          audits of public spending.
        </li>
        <li>
          <strong>Predictive analytics reports</strong> — weekly reports for
          subscribing companies.
        </li>
      </ul>

      <h2 id="deflation">Fee burn &amp; deflation (planned)</h2>
      <p>
        On the Trayon chain, every transaction fee is planned to be split
        three ways: <strong>70%</strong> to validators (rewards),{" "}
        <strong>20%</strong> permanently burned, and <strong>10%</strong> to
        the treasury. Slashed stake is also burned rather than
        redistributed, creating deflationary pressure that scales with
        actual network usage rather than speculative activity.
      </p>

      <h2 id="migration">Migration to the native chain</h2>
      <p>
        When the Trayon chain launches, TRAY on Polygon is planned to be
        exchangeable 1:1 for native TRAY. The migration process and its
        timeline will be announced on this page and on the official
        channels before it starts.
      </p>
    </DocsShell>
  );
}
