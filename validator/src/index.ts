/**
 * Trayon Validator Node - Entry Point
 * Inicializa o node de validador com consensus engine, P2P network, e state machine
 */

import dotenv from 'dotenv';
import Logger from './utils/logger';
import ValidatorNode from './node/core';
import P2PNetwork from './network/p2p';
import ConsensusEngine from './node/consensus';

// Load environment variables
dotenv.config();

const logger = new Logger('ValidatorNode');

/**
 * Initialize and start the validator node
 */
async function main() {
  try {
    logger.info('🚀 Starting Trayon Validator Node...');
    logger.info(`Validator: ${process.env.VALIDATOR_NAME}`);
    logger.info(`Network: ${process.env.L1_RPC_URL}`);

    // Initialize P2P Network
    logger.info('📡 Initializing P2P Network...');
    const p2pNetwork = new P2PNetwork({
      port: parseInt(process.env.P2P_PORT || '30333'),
      host: process.env.P2P_HOST || '0.0.0.0',
      bootstrapNodes: process.env.BOOTSTRAP_NODES?.split(',') || [],
    });

    // Initialize Consensus Engine
    logger.info('🔐 Initializing Consensus Engine...');
    const consensusEngine = new ConsensusEngine({
      validatorAddress: process.env.VALIDATOR_ADDRESS!,
      validatorPrivateKey: process.env.VALIDATOR_PRIVATE_KEY!,
      l1RpcUrl: process.env.L1_RPC_URL!,
      l2RpcUrl: process.env.L2_RPC_URL!,
      trayTokenAddress: process.env.TRAY_TOKEN_ADDRESS!,
      stakingMinimum: BigInt(process.env.MIN_STAKE || '32000000000000000000000'),
    });

    // Initialize Validator Node
    logger.info('⚙️ Initializing Validator Core...');
    const validatorNode = new ValidatorNode({
      name: process.env.VALIDATOR_NAME!,
      address: process.env.VALIDATOR_ADDRESS!,
      p2pNetwork,
      consensusEngine,
    });

    // Start the node
    await validatorNode.start();
    logger.info('✅ Validator Node started successfully!');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Shutting down validator node...');
      await validatorNode.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🛑 Terminating validator node...');
      await validatorNode.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start validator node:', error);
    process.exit(1);
  }
}

// Run
main();
