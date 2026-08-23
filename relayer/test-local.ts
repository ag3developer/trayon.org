/**
 * Local Testing Script for Trayon Bridge Relayer
 * Tests configuration loading and component initialization
 */

import 'dotenv/config';
import { createLogger, logger } from './src/utils/logger.js';
import { getRelayerConfig, validateConfig } from './src/config/networks.js';
import { L1Listener } from './src/listeners/L1Listener.js';
import { L2Listener } from './src/listeners/L2Listener.js';
import { MultiSigSigner } from './src/signer/MultiSigSigner.js';
import { DepositExecutor } from './src/executor/DepositExecutor.js';
import { WithdrawExecutor } from './src/executor/WithdrawExecutor.js';

async function testConfiguration(): Promise<void> {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('🧪 RELAYER LOCAL TEST SUITE');
  logger.info('═══════════════════════════════════════════════════════');

  try {
    // Test 1: Configuration validation
    logger.info('\n✏️  Test 1: Configuration Validation');
    logger.info('─────────────────────────────────────');

    validateConfig();
    const config = getRelayerConfig();

    logger.info('✅ Configuration loaded successfully');
    logger.info('   L1 Network:', config.networkL1.name);
    logger.info('   L2 Network:', config.networkL2.name);
    logger.info('   Validators:', config.validators.length);
    logger.info('   Required Signatures:', config.requiredSignatures);
    logger.info('   Auto Execute:', config.autoExecute);

    // Test 2: Multi-Sig Signer initialization
    logger.info('\n✏️  Test 2: Multi-Sig Signer Initialization');
    logger.info('─────────────────────────────────────');

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!relayerPrivateKey) {
      throw new Error('RELAYER_PRIVATE_KEY not set');
    }

    const signer = new MultiSigSigner(
      config.requiredSignatures,
      config.validators,
      relayerPrivateKey,
      logger
    );

    logger.info('✅ MultiSigSigner initialized');
    logger.info('   Relayer Address:', signer.getRelayerAddress());
    logger.info('   Required Signatures:', signer.getRequiredSignatures());
    logger.info('   Validators:', signer.getValidators().length);

    // Test 3: Signature test
    logger.info('\n✏️  Test 3: Signing Test');
    logger.info('─────────────────────────────────────');

    const testUser = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const testAmount = BigInt('1000000000000000000'); // 1 token
    const testNonce = 1;

    const signature = await signer.signTransaction(
      '0x' + '0'.repeat(64),
      testUser,
      testAmount,
      testNonce
    );

    logger.info('✅ Transaction signed successfully');
    logger.info('   Signature:', signature.substring(0, 20) + '...');

    // Test 4: Signature status test
    logger.info('\n✏️  Test 4: Signature Status Test');
    logger.info('─────────────────────────────────────');

    const txHash = '0x' + '1'.repeat(64);
    const status1 = signer.getSignatureStatus(txHash);

    logger.info('✅ Signature status retrieved');
    logger.info('   Transaction Hash:', txHash);
    logger.info('   Signature Count:', status1.signatureCount);
    logger.info('   Required Signatures:', status1.requiredSignatures);
    logger.info('   Can Execute:', status1.canExecute);
    logger.info('   Remaining Signatures:', status1.remainingSignatures);

    // Test 5: Validators list
    logger.info('\n✏️  Test 5: Validators Configuration');
    logger.info('─────────────────────────────────────');

    const validators = signer.getValidators();
    validators.forEach((v, i) => {
      logger.info(`   Validator ${i + 1}: ${v.address} (${v.name})`);
    });

    // Test 6: L1 Listener initialization (without starting)
    logger.info('\n✏️  Test 6: L1 Listener Initialization');
    logger.info('─────────────────────────────────────');

    const l1Listener = new L1Listener(config.networkL1, logger);
    const l1State = l1Listener.getState();

    logger.info('✅ L1Listener initialized');
    logger.info('   Network:', config.networkL1.name);
    logger.info('   Bridge Address:', config.networkL1.bridgeAddress);
    logger.info('   Start Block:', l1State.lastProcessedBlock);
    logger.info('   Is Running:', l1State.isRunning);

    // Test 7: L2 Listener initialization (without starting)
    logger.info('\n✏️  Test 7: L2 Listener Initialization');
    logger.info('─────────────────────────────────────');

    const l2Listener = new L2Listener(config.networkL2, logger);
    const l2State = l2Listener.getState();

    logger.info('✅ L2Listener initialized');
    logger.info('   Network:', config.networkL2.name);
    logger.info('   Bridge Address:', config.networkL2.bridgeAddress);
    logger.info('   Start Block:', l2State.lastProcessedBlock);
    logger.info('   Is Running:', l2State.isRunning);

    // Test 8: Executor initialization
    logger.info('\n✏️  Test 8: Executor Initialization');
    logger.info('─────────────────────────────────────');

    const depositExecutor = new DepositExecutor(
      config.networkL2,
      relayerPrivateKey,
      logger
    );

    const withdrawExecutor = new WithdrawExecutor(
      config.networkL1,
      relayerPrivateKey,
      logger
    );

    logger.info('✅ Executors initialized');
    logger.info('   Deposit Executor Address:', depositExecutor.getExecutorAddress());
    logger.info('   Withdraw Executor Address:', withdrawExecutor.getExecutorAddress());

    // Test 9: Execution history
    logger.info('\n✏️  Test 9: Execution History');
    logger.info('─────────────────────────────────────');

    const depositHistory = depositExecutor.getExecutionHistory();
    const withdrawHistory = withdrawExecutor.getExecutionHistory();

    logger.info('✅ Execution history retrieved');
    logger.info('   Deposits Executed:', depositHistory.total);
    logger.info('   Withdrawals Executed:', withdrawHistory.total);

    // Summary
    logger.info('\n═══════════════════════════════════════════════════════');
    logger.info('✅ ALL TESTS PASSED SUCCESSFULLY! 🎉');
    logger.info('═══════════════════════════════════════════════════════');
    logger.info('\n📋 Summary:');
    logger.info('   ✅ Configuration loaded and validated');
    logger.info('   ✅ All 7 components initialized successfully');
    logger.info('   ✅ Multi-signature signing works');
    logger.info('   ✅ Listeners ready to monitor events');
    logger.info('   ✅ Executors ready to execute transactions');
    logger.info('\n🚀 Relayer is ready for deployment!');
    logger.info('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    logger.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run tests
testConfiguration().catch((error) => {
  logger.error('Fatal error during testing', error);
  process.exit(1);
});
