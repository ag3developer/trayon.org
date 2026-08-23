/**
 * Validator Node Core
 * Main node class that orchestrates consensus, P2P networking, and state management
 */

import Logger from '../utils/logger';
import P2PNetwork from '../network/p2p';
import ConsensusEngine from './consensus';
import StateMachine from './state-machine';
import StakingManager from '../validator/staking';

interface ValidatorNodeConfig {
  name: string;
  address: string;
  p2pNetwork: P2PNetwork;
  consensusEngine: ConsensusEngine;
}

class ValidatorNode {
  private logger: Logger;
  private name: string;
  private address: string;
  private p2pNetwork: P2PNetwork;
  private consensusEngine: ConsensusEngine;
  private stateMachine: StateMachine;
  private stakingManager: StakingManager;
  private isRunning: boolean = false;

  constructor(config: ValidatorNodeConfig) {
    this.logger = new Logger('ValidatorNode');
    this.name = config.name;
    this.address = config.address;
    this.p2pNetwork = config.p2pNetwork;
    this.consensusEngine = config.consensusEngine;
    this.stateMachine = new StateMachine({
      validatorAddress: config.address,
      l1RpcUrl: process.env.L1_RPC_URL!,
      l2RpcUrl: process.env.L2_RPC_URL!,
    });
    this.stakingManager = new StakingManager({
      validatorAddress: config.address,
      tokenomicsManagerAddress: process.env.TOKENOMICS_MANAGER_ADDRESS!,
    });
  }

  /**
   * Start the validator node
   */
  async start(): Promise<void> {
    try {
      this.logger.info(`Starting validator node: ${this.name}`);

      // Start P2P network
      await this.p2pNetwork.start();
      this.logger.info('✅ P2P Network started');

      // Start consensus engine
      await this.consensusEngine.start();
      this.logger.info('✅ Consensus Engine started');

      // Start state machine
      await this.stateMachine.start();
      this.logger.info('✅ State Machine started');

      // Initialize staking
      const stake = await this.stakingManager.getStake();
      this.logger.info(`Current stake: ${stake} TRAY`);

      // Register event listeners
      this.setupEventListeners();

      this.isRunning = true;
      this.logger.info('🎉 Validator Node is running');
    } catch (error) {
      this.logger.error('Error starting validator node:', error);
      throw error;
    }
  }

  /**
   * Stop the validator node
   */
  async stop(): Promise<void> {
    try {
      this.logger.info('Stopping validator node...');

      await this.p2pNetwork.stop();
      await this.consensusEngine.stop();
      await this.stateMachine.stop();

      this.isRunning = false;
      this.logger.info('✅ Validator node stopped');
    } catch (error) {
      this.logger.error('Error stopping validator node:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for new blocks from consensus
    this.consensusEngine.on('newBlock', async (block) => {
      this.logger.info(`📦 New block: ${block.number}`);
      await this.stateMachine.processBlock(block);
    });

    // Listen for stake changes
    this.stakingManager.on('stakeChanged', (newStake) => {
      this.logger.info(`💰 Stake updated: ${newStake} TRAY`);
    });

    // Listen for slashing events
    this.stakingManager.on('slashed', (amount) => {
      this.logger.warn(`⚠️ Slashed: ${amount} TRAY`);
    });
  }

  /**
   * Get validator status
   */
  getStatus(): object {
    return {
      name: this.name,
      address: this.address,
      isRunning: this.isRunning,
      p2pConnected: this.p2pNetwork.isConnected(),
      consensusActive: this.consensusEngine.isActive(),
      stateHeight: this.stateMachine.getHeight(),
    };
  }

  /**
   * Get validator metrics
   */
  async getMetrics(): Promise<object> {
    return {
      uptime: this.getUptime(),
      stake: await this.stakingManager.getStake(),
      reputation: await this.stakingManager.getReputation(),
      slashings: await this.stakingManager.getSlashingCount(),
      blocksProduced: this.consensusEngine.getBlocksProduced(),
      blocksMissed: this.consensusEngine.getBlocksMissed(),
    };
  }

  private getUptime(): number {
    // TODO: Implement uptime tracking
    return 0;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export default ValidatorNode;
