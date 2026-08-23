import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { ValidatorGrowthChart } from "@/components/docs/charts";

export const metadata: Metadata = {
  title: "Economic Projections",
  description:
    "Conservative, base, and optimistic scenarios for TRAY demand, network usage, and validator growth through 2031.",
};

export default function EconomicProjectionsPage() {
  return (
    <DocsShell currentHref="/docs/economic-projections">
      <h1>Economic Projections</h1>
      <p>
        The figures below model how TRAY price, market cap, and network
        usage could evolve depending on adoption speed. They are{" "}
        <strong>illustrative scenarios, not guarantees</strong> — actual
        results depend on validator onboarding, enterprise adoption of the
        oracle, and broader market conditions. All three scenarios share
        the same tokenomics rules described in{" "}
        <a href="/docs/tokenomics">TRAY Tokenomics</a>: fixed 1B supply,
        20% fee burn, and 32,000 TRAY minimum validator stake.
      </p>

      <h2 id="methodology">Methodology</h2>
      <p>
        Each scenario applies the same pricing model —{" "}
        <code>P(TRAY) = (Demand × Utility) / Deflationary Supply</code> —
        with different assumptions for gas demand, enterprise data-query
        revenue, and validator onboarding pace. The base scenario matches
        the Year 1 / Year 3 / Year 5 figures in the original tokenomics
        model; conservative and optimistic scenarios scale demand growth
        down or up by roughly 3–4x while keeping the burn mechanics fixed.
      </p>

      <h2 id="year-1">Year 1 (2026–2027)</h2>
      <div className="docs-scenarios">
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Conservative</span>
          <dl>
            <div>
              <dt>Annual gas demand</dt>
              <dd>$3M</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~950M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$0.004</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$3.8M</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card is-base">
          <span className="docs-scenario-label">Base case</span>
          <dl>
            <div>
              <dt>Annual gas demand</dt>
              <dd>$10M</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~800M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$0.0125</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$10M</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Optimistic</span>
          <dl>
            <div>
              <dt>Annual gas demand</dt>
              <dd>$35M</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~700M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$0.05</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$35M</dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 id="year-3">Year 3 (2028–2029)</h2>
      <div className="docs-scenarios">
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Conservative</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$150M/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~650M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$0.35</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$230M</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card is-base">
          <span className="docs-scenario-label">Base case</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$700M/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~500M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$1.40</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$700M</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Optimistic</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$2.5B/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~420M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$5.95</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$2.5B</dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 id="year-5">Year 5 (2030–2031)</h2>
      <div className="docs-scenarios">
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Conservative</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$600M/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~400M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$1.50</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$600M</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card is-base">
          <span className="docs-scenario-label">Base case</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$3B/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~250M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$12</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$3B</dd>
            </div>
          </dl>
        </div>
        <div className="docs-scenario-card">
          <span className="docs-scenario-label">Optimistic</span>
          <dl>
            <div>
              <dt>Gas + query demand</dt>
              <dd>$9B/yr</dd>
            </div>
            <div>
              <dt>Circulating supply</dt>
              <dd>~180M TRAY</dd>
            </div>
            <div>
              <dt>Theoretical price</dt>
              <dd>~$50</dd>
            </div>
            <div>
              <dt>Market cap</dt>
              <dd>~$9B</dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 id="validator-growth">Validator &amp; network growth</h2>
      <p>
        Validator onboarding and network TVL are the leading indicators
        for which scenario materializes — more validators mean more stake
        securing the network, and higher TVL signals real enterprise usage
        of the oracle rather than speculative activity alone.
      </p>
      <ValidatorGrowthChart />

      <h2 id="key-drivers">Key drivers to watch</h2>
      <ul>
        <li>
          <strong>Validator onboarding pace</strong> — each new validator
          locks a minimum of 32,000 TRAY, directly reducing liquid supply.
        </li>
        <li>
          <strong>Enterprise query volume</strong> — government audits and
          corporate data-verification contracts (see{" "}
          <a href="/docs/tokenomics#utility">Utility</a>) drive the
          highest-value burn events, since large one-off queries (e.g. a
          full government procurement audit) can burn tens of thousands of
          TRAY in a single transaction.
        </li>
        <li>
          <strong>Fee burn rate governance</strong> — the DAO can vote to
          adjust the 20% burn rate; a higher rate accelerates deflation at
          the cost of validator/treasury revenue share.
        </li>
        <li>
          <strong>Regional expansion</strong> — each new compliance region
          (see the <a href="/whitepaper">whitepaper roadmap</a>) unlocks a
          new class of government and audit-firm customers.
        </li>
      </ul>

      <div className="docs-callout">
        These projections are for illustration only and do not constitute
        financial advice or a guarantee of future performance. See the{" "}
        <a href="/whitepaper">whitepaper</a> for the full risk disclosures
        and roadmap assumptions.
      </div>
    </DocsShell>
  );
}
