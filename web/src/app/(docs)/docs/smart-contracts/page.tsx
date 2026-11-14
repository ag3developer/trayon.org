import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";
import { TRAY_TOKEN } from "@/lib/token";

export const metadata: Metadata = {
  title: "Smart Contracts",
  description:
    "Reference for the core Trayon smart contracts: the TRAY token, ValidatorRegistry, and TrayonOracle.",
};

export default function SmartContractsPage() {
  return (
    <DocsShell currentHref="/docs/smart-contracts">
      <h1>Smart Contracts</h1>
      <p>
        Trayon&apos;s core protocol logic is implemented in Solidity 0.8.19
        and organized into three primary contracts. Interfaces below are
        simplified for reference — see the repository for full
        implementations and tests.
      </p>

      <h2 id="trayon-token">TRAYONToken.sol</h2>
      <p>
        The TRAY token deployed today on Polygon PoS at{" "}
        <a href={TRAY_TOKEN.explorerUrl} target="_blank" rel="noopener noreferrer">
          <code>{TRAY_TOKEN.address}</code>
        </a>{" "}
        (source verified on Polygonscan). Supply is hard-capped at 21,000,000
        TRAY, and minting has been permanently disabled with{" "}
        <a href={TRAY_TOKEN.finalizedTx} target="_blank" rel="noopener noreferrer">
          <code>finalize()</code>
        </a>{" "}
        on {TRAY_TOKEN.finalizedDate}. When the Trayon chain launches, TRAY is planned to become its
        native gas token through a 1:1 migration.
      </p>
      <pre>
        <code>{`contract TRAYONToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 21_000_000 * 10**18;
    bool public isFinalized;

    function mint(address to, uint256 amount) public onlyOwner; // never above MAX_SUPPLY
    function burn(uint256 amount) public;
    function finalize() external onlyOwner; // permanently disables mint
}`}</code>
      </pre>

      <h2 id="validator-registry">ValidatorRegistry.sol</h2>
      <p>
        Handles validator staking, slashing, and lifecycle. Requires a
        minimum stake of 32,000 TRAY to register as a validator.
      </p>
      <pre>
        <code>{`contract ValidatorRegistry {
    uint256 public constant MIN_STAKE = 32_000 * 10**18;
    uint256 public constant SLASH_DATA_FALSE = 50;  // percent
    uint256 public constant SLASH_DOWNTIME = 10;    // percent
    uint256 public constant SLASH_BYZANTINE = 100;  // percent

    function registerValidator() external;
    function slashValidator(address validator, uint256 percentage, string calldata reason) external;
    function exitValidator() external;
    function getActiveValidatorCount() external view returns (uint256);
    function updateReputation(address validator, int256 change) external;
}`}</code>
      </pre>

      <h2 id="trayon-oracle">TrayonOracle.sol</h2>
      <p>
        Stores data commitments as Merkle roots with aggregated validator
        signatures, and exposes the latest verified value for a given data
        type.
      </p>
      <pre>
        <code>{`contract TrayonOracle {
    struct DataCommitment {
        bytes32 merkleRoot;
        uint256 timestamp;
        address[] validators;
        bytes aggregatedSignature;
        bool finalized;
    }

    function commitData(
        bytes32 merkleRoot,
        address[] calldata validators,
        bytes calldata aggregatedSignature,
        uint256 timestamp
    ) external;

    function verifyData(bytes32 merkleRoot, bytes32[] calldata proof, bytes32 leaf)
        external view returns (bool);
}`}</code>
      </pre>

      <div className="docs-callout">
        Full contract source, tests, and deployment scripts live in the{" "}
        <code>contracts/</code> workspace of the Trayon monorepo. See{" "}
        <a href="/docs/api-reference">API Reference</a> to query committed
        data without deploying your own indexer.
      </div>
    </DocsShell>
  );
}
