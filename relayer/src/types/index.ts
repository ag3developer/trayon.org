/**
 * Trayon Bridge Relayer - Type Definitions
 * Core types used across the relayer system
 */

/**
 * Network configuration for L1 or L2
 */
export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  bridgeAddress: string;
  trayAddress: string;
  startBlock: number;
}

/**
 * Deposit event from L1 (DepositInitiated)
 */
export interface DepositEvent {
  user: string;
  amount: bigint;
  nonce: string; // Changed from depositHash to match contract event
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  processed: boolean;
  signatures?: string[];
}

/**
 * Withdrawal event from L2 (WithdrawalInitiated)
 */
export interface WithdrawalEvent {
  user: string;
  amount: bigint;
  withdrawalHash: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  processed: boolean;
  signatures?: string[];
}

/**
 * Signature data for multi-sig validation
 */
export interface SignatureData {
  validator: string;
  signature: string;
  timestamp: number;
}

/**
 * Transaction execution result
 */
export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  gasUsed?: bigint;
}

/**
 * Relayer configuration
 */
export interface RelayerConfig {
  networkL1: NetworkConfig;
  networkL2: NetworkConfig;
  validators: ValidatorConfig[];
  requiredSignatures: number;
  pollingInterval: number;
  autoExecute: boolean;
  dryRun: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Validator configuration
 */
export interface ValidatorConfig {
  address: string;
  name: string;
  enabled: boolean;
}

/**
 * Bridge event listener state
 */
export interface ListenerState {
  lastProcessedBlock: number;
  totalEventsFound: number;
  lastEventTime: number;
  isRunning: boolean;
  errors: number;
}

/**
 * Multi-sig execution request
 */
export interface MultiSigRequest {
  type: 'deposit' | 'withdrawal';
  user: string;
  amount: bigint;
  hash: string;
  signatures: SignatureData[];
  createdAt: number;
  executedAt?: number;
  status: 'pending' | 'executed' | 'failed';
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}
