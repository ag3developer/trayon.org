/**
 * L2 Bridge Listener
 * Monitors BridgeL2 for WithdrawalInitiated events
 * Triggered when users initiate withdrawal on Trayon testnet
 */

import { Contract, JsonRpcProvider, EventLog } from 'ethers';
import type { WithdrawalEvent, NetworkConfig, Logger } from '../types/index.js';
import { BRIDGE_L2_ABI } from '../config/abis.js';

export class L2Listener {
  private contract: Contract;
  private provider: JsonRpcProvider;
  private lastProcessedBlock: number;
  private isRunning: boolean = false;
  private totalEventsFound: number = 0;
  private lastEventTime: number = 0;
  private errors: number = 0;

  constructor(
    private networkConfig: NetworkConfig,
    private logger: Logger
  ) {
    this.provider = new JsonRpcProvider(networkConfig.rpcUrl);
    this.contract = new Contract(
      networkConfig.bridgeAddress,
      BRIDGE_L2_ABI,
      this.provider
    );
    this.lastProcessedBlock = networkConfig.startBlock;
  }

  /**
   * Start listening for WithdrawalInitiated events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('L2Listener is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('L2Listener started', {
      network: this.networkConfig.name,
      startBlock: this.lastProcessedBlock,
    });

    // Start polling for events
    this.poll();
  }

  /**
   * Stop listening for events
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('L2Listener stopped', {
      totalEvents: this.totalEventsFound,
      totalErrors: this.errors,
    });
  }

  /**
   * Poll for new WithdrawalInitiated events
   */
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        const currentBlock = await this.provider.getBlockNumber();

        if (currentBlock > this.lastProcessedBlock) {
          const events = await this.fetchEvents(
            this.lastProcessedBlock + 1,
            currentBlock
          );

          if (events.length > 0) {
            this.logger.info('Found WithdrawalInitiated events', {
              count: events.length,
              fromBlock: this.lastProcessedBlock + 1,
              toBlock: currentBlock,
            });

            for (const event of events) {
              await this.handleWithdrawalInitiated(event);
            }

            this.lastEventTime = Date.now();
            this.totalEventsFound += events.length;
          }

          this.lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        this.errors++;
        this.logger.error('Error in L2Listener poll', error);
      }

      // Wait before polling again (default 12 seconds)
      await this.sleep(12000);
    }
  }

  /**
   * Fetch WithdrawalInitiated events from a block range
   */
  private async fetchEvents(
    fromBlock: number,
    toBlock: number
  ): Promise<WithdrawalEvent[]> {
    try {
      const events = await this.contract.queryFilter(
        'WithdrawalInitiated',
        fromBlock,
        toBlock
      );
      const withdrawals: WithdrawalEvent[] = [];

      for (const event of events) {
        if (!(event instanceof EventLog)) continue;

        const [user, amount] = event.args;
        
        // Generate withdrawal hash based on user and amount
        const withdrawalHash = this.generateHash(user as string, amount as bigint);
        
        const block = await this.provider.getBlock(event.blockNumber);
        const timestamp = block?.timestamp || Math.floor(Date.now() / 1000);

        withdrawals.push({
          user: user as string,
          amount: BigInt(amount as bigint),
          withdrawalHash,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp,
          processed: false,
        });

        this.logger.debug('Parsed WithdrawalInitiated event', {
          user,
          amount: amount.toString(),
          withdrawalHash,
          blockNumber: event.blockNumber,
        });
      }

      return withdrawals;
    } catch (error) {
      this.logger.error('Error fetching L2 events', error);
      throw error;
    }
  }

  /**
   * Handle a WithdrawalInitiated event
   */
  private async handleWithdrawalInitiated(event: WithdrawalEvent): Promise<void> {
    this.logger.info('Processing WithdrawalInitiated event', {
      user: event.user,
      amount: event.amount.toString(),
      withdrawalHash: event.withdrawalHash,
      blockNumber: event.blockNumber,
    });

    // Emit event to be handled by MultiSigSigner
    // In a real implementation, this would call a callback or emit an event
    // that the relayer coordinator would pick up
  }

  /**
   * Generate hash for withdrawal (matches BridgeL1 format)
   */
  private generateHash(user: string, amount: bigint): string {
    // This would typically be keccak256(abi.encodePacked(user, amount))
    // For now, we'll use a simple format - in production use proper hashing
    return `0x${Buffer.from(`${user}${amount.toString()}`).toString('hex')}`;
  }

  /**
   * Get listener state
   */
  getState() {
    return {
      lastProcessedBlock: this.lastProcessedBlock,
      totalEventsFound: this.totalEventsFound,
      lastEventTime: this.lastEventTime,
      isRunning: this.isRunning,
      errors: this.errors,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
