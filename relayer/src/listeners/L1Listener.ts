/**
 * L1 Bridge Listener
 * Monitors BridgeL1 for DepositInitiated events
 * Triggered when users deposit on Polygon Amoy
 */

import { Contract, JsonRpcProvider, EventLog } from 'ethers';
import type { DepositEvent, NetworkConfig, Logger } from '../types/index.js';
import { BRIDGE_L1_ABI } from '../config/abis.js';

export class L1Listener {
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
      BRIDGE_L1_ABI,
      this.provider
    );
    this.lastProcessedBlock = networkConfig.startBlock;
  }

  /**
   * Start listening for DepositInitiated events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('L1Listener is already running');
      return;
    }

    this.isRunning = true;

    // If starting from block 0, get current block instead (important for RPC limits)
    if (this.lastProcessedBlock === 0) {
      try {
        this.lastProcessedBlock = await this.provider.getBlockNumber();
        this.logger.info('L1Listener starting from current block', {
          network: this.networkConfig.name,
          startBlock: this.lastProcessedBlock,
        });
      } catch (error) {
        this.logger.error('Error getting current block number', error);
        this.lastProcessedBlock = 0;
      }
    }

    this.logger.info('L1Listener started', {
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
    this.logger.info('L1Listener stopped', {
      totalEvents: this.totalEventsFound,
      totalErrors: this.errors,
    });
  }

  /**
   * Poll for new DepositInitiated events
   */
  private async poll(): Promise<void> {
    this.logger.info('L1Listener poll() started - beginning event polling loop');
    
    while (this.isRunning) {
      try {
        const currentBlock = await this.provider.getBlockNumber();
        this.logger.debug('L1Listener polling', {
          currentBlock,
          lastProcessedBlock: this.lastProcessedBlock,
        });

        if (currentBlock > this.lastProcessedBlock) {
          this.logger.info('Fetching events from blocks', {
            fromBlock: this.lastProcessedBlock + 1,
            toBlock: currentBlock,
          });
          
          const events = await this.fetchEvents(
            this.lastProcessedBlock + 1,
            currentBlock
          );

          if (events.length > 0) {
            this.logger.info('Found DepositInitiated events', {
              count: events.length,
              fromBlock: this.lastProcessedBlock + 1,
              toBlock: currentBlock,
            });

            for (const event of events) {
              await this.handleDepositInitiated(event);
            }

            this.lastEventTime = Date.now();
            this.totalEventsFound += events.length;
          } else {
            this.logger.debug('No events found in range', {
              fromBlock: this.lastProcessedBlock + 1,
              toBlock: currentBlock,
            });
          }

          this.lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        this.errors++;
        this.logger.error('Error in L1Listener poll', error);
      }

      // Wait before polling again (default 12 seconds)
      this.logger.debug('L1Listener waiting 12 seconds before next poll');
      await this.sleep(12000);
    }
  }

  /**
   * Fetch DepositInitiated events from a block range
   * Chunks queries into 10000 block ranges to respect RPC limits
   */
  private async fetchEvents(
    fromBlock: number,
    toBlock: number
  ): Promise<DepositEvent[]> {
    try {
      const CHUNK_SIZE = 10000;
      const allDeposits: DepositEvent[] = [];
      
      // Process in chunks if range > 10000
      for (let chunk = fromBlock; chunk <= toBlock; chunk += CHUNK_SIZE) {
        const chunkEnd = Math.min(chunk + CHUNK_SIZE - 1, toBlock);
        
        const events = await this.contract.queryFilter('DepositInitiated', chunk, chunkEnd);
        const deposits: DepositEvent[] = [];

      for (const event of events) {
        if (!(event instanceof EventLog)) continue;

        const [user, amount, nonce] = event.args;
        
        const block = await this.provider.getBlock(event.blockNumber);
        const timestamp = block?.timestamp || Math.floor(Date.now() / 1000);

        deposits.push({
          user: user as string,
          amount: BigInt(amount as bigint),
          nonce: nonce.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp,
          processed: false,
        });

        this.logger.debug('Parsed DepositInitiated event', {
          user,
          amount: amount.toString(),
          nonce: nonce.toString(),
          blockNumber: event.blockNumber,
        });
      }
      
      // Add chunk deposits to all deposits
      allDeposits.push(...deposits);
      }

      return allDeposits;
    } catch (error) {
      this.logger.error('Error fetching L1 events', error);
      throw error;
    }
  }

  /**
   * Handle a DepositInitiated event
   */
  private async handleDepositInitiated(event: DepositEvent): Promise<void> {
    this.logger.info('Processing DepositInitiated event', {
      user: event.user,
      amount: event.amount.toString(),
      nonce: event.nonce,
      blockNumber: event.blockNumber,
    });

    // Emit event to be handled by MultiSigSigner
    // In a real implementation, this would call a callback or emit an event
    // that the relayer coordinator would pick up
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
