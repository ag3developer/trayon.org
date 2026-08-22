import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Smart Contracts",
  description:
    "Reference for the core Trayon smart contracts: TrayonToken, ValidatorRegistry, and TrayonOracle.",
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

      <h2 id="trayon-token">TrayonToken.sol</h2>
      <p>
        The native ERC-20 gas and staking token. Total supply is fixed at
        launch; the sequencer burns TRAY to pay for gas, and 20% of all
        collected fees are permanently burned.
      </p>
      <pre>
        <code>{`contract TrayonToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant BURN_RATE = 20; // percent of fees burned

    function consumeGas(address user, uint256 amount) external;
    function burn(uint256 amount) public;
    function getCurrentSupply() external view returns (uint256);
    function getDeflationPercentage() external view returns (uint256);
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
