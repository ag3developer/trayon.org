/**
 * Trayon Bridge Relayer
 * Main entry point - coordinates L1/L2 listeners and executors
 */

import 'dotenv/config';
import { logger } from './utils/logger.js';
import { getRelayerConfig, validateConfig } from './config/networks.js';
import { L1Listener } from './listeners/L1Listener.js';
import { L2Listener } from './listeners/L2Listener.js';
import { MultiSigSigner } from './signer/MultiSigSigner.js';
import { DepositExecutor } from './executor/DepositExecutor.js';
import { WithdrawExecutor } from './executor/WithdrawExecutor.js';

/**
 * Relayer Coordinator
 * Orchestrates all relayer components
 */
class RelayerCoordinator {
  private l1Listener: L1Listener | null = null;
  private l2Listener: L2Listener | null = null;
  private multiSigSigner: MultiSigSigner | null = null;
  private depositExecutor: DepositExecutor | null = null;
  private withdrawExecutor: WithdrawExecutor | null = null;
  private isRunning = false;

  constructor(private loggerInstance: typeof logger) {}

  /**
   * Initialize all relayer components
   */
  async initialize(): Promise<void> {
    try {
      this.loggerInstance.info('═══════════════════════════════════════════════════════');
      this.loggerInstance.info('   🌉 Trayon Bridge Relayer v1.0.0');
      this.loggerInstance.info('═══════════════════════════════════════════════════════');

      // Validate configuration
      validateConfig();
      const config = getRelayerConfig();

      this.loggerInstance.info('Configuration loaded', {
        l1Network: config.networkL1.name,
        l2Network: config.networkL2.name,
        validators: config.validators.length,
        requiredSignatures: config.requiredSignatures,
        autoExecute: config.autoExecute,
      });

      // Get private key
      const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
      if (!relayerPrivateKey) {
        throw new Error('RELAYER_PRIVATE_KEY not set in environment');
      }

      // Initialize listeners
      this.l1Listener = new L1Listener(config.networkL1, this.loggerInstance);
      this.l2Listener = new L2Listener(config.networkL2, this.loggerInstance);

      // Initialize multi-sig signer
      this.multiSigSigner = new MultiSigSigner(
        config.requiredSignatures,
        config.validators,
        relayerPrivateKey,
        this.loggerInstance
      );

      // Initialize executors
      this.depositExecutor = new DepositExecutor(
        config.networkL2,
        relayerPrivateKey,
        this.loggerInstance
      );

      this.withdrawExecutor = new WithdrawExecutor(
        config.networkL1,
        relayerPrivateKey,
        this.loggerInstance
      );

      this.loggerInstance.info('✅ All components initialized successfully');
      this.printStatus();
    } catch (error) {
      this.loggerInstance.error('Failed to initialize relayer', error);
      process.exit(1);
    }
  }

  /**
   * Start all relayer listeners
   */
  async start(): Promise<void> {
    try {
      if (this.isRunning) {
        this.loggerInstance.warn('Relayer is already running');
        return;
      }

      this.loggerInstance.info('Starting relayer listeners...');

      if (!this.l1Listener || !this.l2Listener) {
        throw new Error('Listeners not initialized');
      }

      // Start listeners
      await this.l1Listener.start();
      await this.l2Listener.start();

      this.isRunning = true;

      this.loggerInstance.info('═══════════════════════════════════════════════════════');
      this.loggerInstance.info('   🚀 Relayer Started Successfully');
      this.loggerInstance.info('═══════════════════════════════════════════════════════');
      this.loggerInstance.info('Listening for events on:');
      this.loggerInstance.info('  - L1 (Polygon Amoy): DepositInitiated');
      this.loggerInstance.info('  - L2 (Trayon Testnet): WithdrawalInitiated');
      this.loggerInstance.info('═══════════════════════════════════════════════════════');

      // Print status periodically
      this.statusInterval();
    } catch (error) {
      this.loggerInstance.error('Failed to start relayer', error);
      process.exit(1);
    }
  }

  /**
   * Stop all relayer listeners
   */
  async stop(): Promise<void> {
    try {
      this.loggerInstance.info('Stopping relayer...');

      if (this.l1Listener) await this.l1Listener.stop();
      if (this.l2Listener) await this.l2Listener.stop();

      this.isRunning = false;

      this.loggerInstance.info('✅ Relayer stopped successfully');
      this.printStatus();
    } catch (error) {
      this.loggerInstance.error('Error stopping relayer', error);
    }
  }

  /**
   * Print current relayer status
   */
  private printStatus(): void {
    this.loggerInstance.info('═══════════════════════════════════════════════════════');
    this.loggerInstance.info('📊 Relayer Status:');

    if (this.l1Listener) {
      const l1State = this.l1Listener.getState();
      this.loggerInstance.info('  L1 Listener:', l1State);
    }

    if (this.l2Listener) {
      const l2State = this.l2Listener.getState();
      this.loggerInstance.info('  L2 Listener:', l2State);
    }

    if (this.multiSigSigner) {
      this.loggerInstance.info('  Relayer Address:', this.multiSigSigner.getRelayerAddress());
      this.loggerInstance.info(
        '  Validators:',
        this.multiSigSigner.getValidators().length
      );
      this.loggerInstance.info(
        '  Required Signatures:',
        this.multiSigSigner.getRequiredSignatures()
      );
    }

    if (this.depositExecutor) {
      const history = this.depositExecutor.getExecutionHistory();
      this.loggerInstance.info('  Deposits Executed:', history.total);
    }

    if (this.withdrawExecutor) {
      const history = this.withdrawExecutor.getExecutionHistory();
      this.loggerInstance.info('  Withdrawals Executed:', history.total);
    }

    this.loggerInstance.info('═══════════════════════════════════════════════════════');
  }

  /**
   * Print status periodically
   */
  private statusInterval(): void {
    setInterval(() => {
      if (this.isRunning) {
        this.printStatus();
      }
    }, 300000); // Every 5 minutes
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const coordinator = new RelayerCoordinator(logger);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal - shutting down gracefully...');
    await coordinator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal - shutting down gracefully...');
    await coordinator.stop();
    process.exit(0);
  });

  // Initialize and start relayer
  await coordinator.initialize();
  await coordinator.start();
}

// Run main
main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
