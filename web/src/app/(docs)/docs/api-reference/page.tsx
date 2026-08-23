import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { MainSiteLink } from "@/components/docs/MainSiteLink";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "REST API reference for querying Trayon committed data, validators, and network status.",
};

export default function ApiReferencePage() {
  return (
    <DocsShell currentHref="/docs/api-reference">
      <h1>API Reference</h1>
      <p>
        The Trayon API exposes read access to committed data, validator
        status, and network health without requiring you to run your own
        indexer. All endpoints are versioned under <code>/v1</code>.
      </p>

      <div className="docs-callout">
        Base URL: <code>https://api.trayon.org/v1</code> — public endpoints
        are rate-limited; authenticated partner access is available on
        request via{" "}
        <MainSiteLink href="/#contact">partnership inquiries</MainSiteLink>.
      </div>

      <h2 id="get-data">GET /data/:dataType</h2>
      <p>Returns the latest verified value committed for a data type.</p>
      <pre>
        <code>{`GET /v1/data/gov.budget.execution.br
Response 200:
{
  "dataType": "gov.budget.execution.br",
  "value": 128340000000,
  "precision": 2,
  "merkleRoot": "0x9f2c...a31e",
  "timestamp": "2026-08-20T14:03:00Z",
  "validators": 743,
  "finalized": true
}`}</code>
      </pre>

      <h2 id="get-proof">GET /data/:dataType/proof</h2>
      <p>Returns a Merkle proof for the latest committed value, verifiable against the on-chain root.</p>
      <pre>
        <code>{`GET /v1/data/gov.budget.execution.br/proof
Response 200:
{
  "merkleRoot": "0x9f2c...a31e",
  "leaf": "0x77ab...44d0",
  "proof": ["0x1a2b...", "0x3c4d...", "0x5e6f..."]
}`}</code>
      </pre>

      <h2 id="get-validators">GET /validators</h2>
      <p>Returns the current active validator set with stake and reputation.</p>
      <pre>
        <code>{`GET /v1/validators?active=true&limit=50
Response 200:
{
  "total": 1042,
  "results": [
    { "operator": "0xAb12...", "stake": "32000000000000000000000", "reputation": 98 },
    { "operator": "0x9F44...", "stake": "48000000000000000000000", "reputation": 95 }
  ]
}`}</code>
      </pre>

      <h2 id="get-status">GET /network/status</h2>
      <p>Returns network-wide health metrics.</p>
      <pre>
        <code>{`GET /v1/network/status
Response 200:
{
  "activeValidators": 1042,
  "totalStaked": "34186000000000000000000000",
  "totalBurned": "18420000000000000000000000",
  "avgBlockTime": 12.1,
  "uptime30d": 99.992
}`}</code>
      </pre>

      <h2 id="errors">Error format</h2>
      <pre>
        <code>{`{
  "error": {
    "code": "DATA_NOT_FOUND",
    "message": "No committed value exists for the given dataType"
  }
}`}</code>
      </pre>
    </DocsShell>
  );
}
