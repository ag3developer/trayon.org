/**
 * Staking Manager
 * Manages validator staking and rewards
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import Logger from '../utils/logger';

interface StakingConfig {
  validatorAddress: string;
  tokenomicsManagerAddress: string;
}

class StakingManager extends EventEmitter {
  private logger: Logger;
  private config: StakingConfig;
  private currentStake: bigint = BigInt(0);
  private reputation: number = 100;
  private slashingCount: number = 0;
  private provider: ethers.JsonRpcProvider;

  constructor(config: StakingConfig) {
    super();
    this.logger = new Logger('StakingManager');
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(process.env.L1_RPC_URL!);
  }

  /**
   * Get validator stake
   */
  async getStake(): Promise<bigint> {
    try {
      // TODO: Query from TokenomicsManager contract
      return this.currentStake;
    } catch (error) {
      this.logger.error('Error getting stake:', error);
      return BigInt(0);
    }
  }

  /**
   * Get validator reputation
   */
  async getReputation(): Promise<number> {
    return this.reputation;
  }

  /**
   * Get slashing count
   */
  async getSlashingCount(): Promise<number> {
    return this.slashingCount;
  }

  /**
   * Update stake
   */
  async updateStake(newStake: bigint): Promise<void> {
    try {
      this.logger.info(`Updating stake from ${this.currentStake} to ${newStake}`);
      this.currentStake = newStake;
      this.emit('stakeChanged', newStake);
    } catch (error) {
      this.logger.error('Error updating stake:', error);
    }
  }

  /**
   * Increment reputation
   */
  incrementReputation(amount: number = 10): void {
    this.reputation = Math.min(this.reputation + amount, 100);
    this.logger.info(`Reputation increased to ${this.reputation}`);
  }

  /**
   * Decrement reputation (on slashing)
   */
  decrementReputation(amount: number = 20): void {
    this.reputation = Math.max(this.reputation - amount, 0);
    this.logger.warn(`Reputation decreased to ${this.reputation}`);
  }

  /**
   * Record slashing event
   */
  recordSlashing(amount: bigint, reason: string): void {
    this.slashingCount++;
    this.decrementReputation(20);
    this.logger.warn(`Slashed: ${amount} TRAY - ${reason}`);
    this.emit('slashed', amount);
  }

  /**
   * Claim rewards
   */
  async claimRewards(): Promise<bigint> {
    try {
      this.logger.info('Claiming rewards...');
      // TODO: Call TokenomicsManager.collectAndDistributeFees()
      const reward = BigInt(0);
      return reward;
    } catch (error) {
      this.logger.error('Error claiming rewards:', error);
      return BigInt(0);
    }
  }

  /**
   * Is validator in good standing
   */
  isInGoodStanding(): boolean {
    return this.reputation > 50 && this.slashingCount < 3;
  }
}

export default StakingManager;
