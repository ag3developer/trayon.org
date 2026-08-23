/**
 * State Machine
 * Manages the state of the L2 and processes blocks
 */

import Logger from '../utils/logger';
import { ethers } from 'ethers';

interface StateMachineConfig {
  validatorAddress: string;
  l1RpcUrl: string;
  l2RpcUrl: string;
}

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  proposer: string;
  transactions: string[];
  stateRoot: string;
}

class StateMachine {
  private logger: Logger;
  private config: StateMachineConfig;
  private currentStateRoot: string = '';
  private currentHeight: number = 0;
  private provider: ethers.JsonRpcProvider;

  constructor(config: StateMachineConfig) {
    this.logger = new Logger('StateMachine');
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.l2RpcUrl);
  }

  /**
   * Start state machine
   */
  async start(): Promise<void> {
    try {
      this.logger.info('Starting state machine...');

      // Get current block
      const blockNumber = await this.provider.getBlockNumber();
      this.currentHeight = blockNumber;

      this.logger.info(`✅ State machine started at block ${this.currentHeight}`);
    } catch (error) {
      this.logger.error('Error starting state machine:', error);
      throw error;
    }
  }

  /**
   * Stop state machine
   */
  async stop(): Promise<void> {
    this.logger.info('✅ State machine stopped');
  }

  /**
   * Process a block
   */
  async processBlock(block: Block): Promise<void> {
    try {
      this.logger.info(`Processing block ${block.number}...`);

      // Validate block
      if (!this.validateBlock(block)) {
        this.logger.warn(`Block ${block.number} validation failed`);
        return;
      }

      // Execute transactions
      for (const txHash of block.transactions) {
        await this.executeTransaction(txHash);
      }

      // Update state
      this.currentHeight = block.number;
      this.currentStateRoot = block.stateRoot;

      this.logger.info(`✅ Block ${block.number} processed`);
    } catch (error) {
      this.logger.error('Error processing block:', error);
    }
  }

  /**
   * Validate block
   */
  private validateBlock(block: Block): boolean {
    // Check block properties
    if (!block.hash || block.number <= this.currentHeight) {
      return false;
    }

    // Check parent block
    if (!block.parentHash) {
      return false;
    }

    return true;
  }

  /**
   * Execute a transaction
   */
  private async executeTransaction(txHash: string): Promise<void> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        this.logger.warn(`Transaction ${txHash} not found`);
        return;
      }

      // TODO: Execute transaction logic
      this.logger.info(`Transaction ${txHash} executed`);
    } catch (error) {
      this.logger.error(`Error executing transaction ${txHash}:`, error);
    }
  }

  /**
   * Get current state root
   */
  getStateRoot(): string {
    return this.currentStateRoot;
  }

  /**
   * Get current height
   */
  getHeight(): number {
    return this.currentHeight;
  }

  /**
   * Get state at height
   */
  async getStateAt(height: number): Promise<object> {
    try {
      const block = await this.provider.getBlock(height);
      if (!block) {
        throw new Error(`Block ${height} not found`);
      }

      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        stateRoot: block.miningReward, // Simplified
      };
    } catch (error) {
      this.logger.error(`Error getting state at ${height}:`, error);
      throw error;
    }
  }
}

export default StateMachine;
