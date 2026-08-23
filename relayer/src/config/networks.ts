/**
 * Network Configuration for Trayon Bridge
 * Defines RPC endpoints, contract addresses, and chain information
 */

import type { NetworkConfig, RelayerConfig, ValidatorConfig } from '../types/index.js';

/**
 * Polygon Amoy (L1) Configuration
 */
export const polygonAmoyConfig: NetworkConfig = {
  name: 'polygon-amoy',
  rpcUrl: process.env.RPC_POLYGON_AMOY || 'https://rpc-amoy.polygon.technology',
  chainId: 80002,
  bridgeAddress: process.env.BRIDGE_L1_ADDRESS || '',
  trayAddress: process.env.TRAY_L1_ADDRESS || '',
  startBlock: parseInt(process.env.LISTEN_START_BLOCK_L1 || '0', 10),
};

/**
 * Trayon Testnet (L2) Configuration
 */
export const trayonTestnetConfig: NetworkConfig = {
  name: 'trayon-testnet',
  rpcUrl: process.env.RPC_TRAYON_TESTNET || 'http://localhost:8545',
  chainId: 7654321,
  bridgeAddress: process.env.BRIDGE_L2_ADDRESS || '',
  trayAddress: process.env.TRAY_L2_ADDRESS || '',
  startBlock: parseInt(process.env.LISTEN_START_BLOCK_L2 || '0', 10),
};

/**
 * Validators Configuration
 */
export const getValidators = (): ValidatorConfig[] => {
  const validators: ValidatorConfig[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const address = process.env[`VALIDATOR_${i}_ADDRESS`];
    if (address) {
      validators.push({
        address,
        name: `Validator ${i}`,
        enabled: true,
      });
    }
  }

  return validators;
};

/**
 * Full Relayer Configuration
 */
export const getRelayerConfig = (): RelayerConfig => {
  const validators = getValidators();
  
  if (validators.length === 0) {
    throw new Error('No validators configured. Set VALIDATOR_*_ADDRESS environment variables.');
  }

  const requiredSignatures = parseInt(process.env.REQUIRED_SIGNATURES || '3', 10);
  if (requiredSignatures > validators.length) {
    throw new Error(
      `Required signatures (${requiredSignatures}) exceeds number of validators (${validators.length})`
    );
  }

  return {
    networkL1: polygonAmoyConfig,
    networkL2: trayonTestnetConfig,
    validators,
    requiredSignatures,
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || '12000', 10),
    autoExecute: process.env.ENABLE_AUTO_EXECUTE === 'true',
    dryRun: process.env.DRY_RUN === 'true',
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  };
};

/**
 * Validate all required environment variables
 */
export const validateConfig = (): void => {
  const required = [
    'BRIDGE_L1_ADDRESS',
    'BRIDGE_L2_ADDRESS',
    'TRAY_L1_ADDRESS',
    'TRAY_L2_ADDRESS',
    'RELAYER_PRIVATE_KEY',
    'RELAYER_ADDRESS',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
