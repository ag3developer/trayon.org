/**
 * Withdrawal Executor
 * Executes completeWithdrawal on BridgeL1 to release tokens back to users
 * Called after collecting required signatures from validators
 */

import { Contract, Wallet, JsonRpcProvider, TransactionResponse } from 'ethers';
import type { ExecutionResult, NetworkConfig, Logger, SignatureData } from '../types/index.js';
import { BRIDGE_L1_ABI } from '../config/abis.js';

export class WithdrawExecutor {
  private contract: Contract;
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private executionHistory: Map<string, ExecutionResult> = new Map();

  constructor(
    networkConfig: NetworkConfig,
    relayerPrivateKey: string,
    private logger: Logger
  ) {
    this.provider = new JsonRpcProvider(networkConfig.rpcUrl);
    this.signer = new Wallet(relayerPrivateKey, this.provider);
    this.contract = new Contract(
      networkConfig.bridgeAddress,
      BRIDGE_L1_ABI,
      this.signer
    );

    this.logger.info('WithdrawExecutor initialized', {
      network: networkConfig.name,
      executorAddress: this.signer.address,
      bridgeAddress: networkConfig.bridgeAddress,
    });
  }

  /**
   * Execute completeWithdrawal on BridgeL1
   */
  async executeWithdrawal(
    user: string,
    amount: bigint,
    withdrawalHash: string,
    signatures?: SignatureData[]
  ): Promise<ExecutionResult> {
    try {
      this.logger.info('Executing withdrawal on L1', {
        user,
        amount: amount.toString(),
        withdrawalHash,
        signatureCount: signatures?.length || 0,
      });

      // Check if already executed
      if (this.executionHistory.has(withdrawalHash)) {
        const result = this.executionHistory.get(withdrawalHash)!;
        this.logger.warn('Withdrawal already executed', {
          withdrawalHash,
          transactionHash: result.transactionHash,
        });
        return result;
      }

      // Call completeWithdrawal on BridgeL1
      const tx: TransactionResponse = await this.contract.completeWithdrawal(
        user,
        amount,
        withdrawalHash
      );

      this.logger.info('Withdrawal transaction submitted', {
        transactionHash: tx.hash,
        user,
        amount: amount.toString(),
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('Transaction failed - no receipt');
      }

      const result: ExecutionResult = {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };

      this.executionHistory.set(withdrawalHash, result);

      this.logger.info('Withdrawal executed successfully', {
        withdrawalHash,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const result: ExecutionResult = {
        success: false,
        error: errorMsg,
      };

      this.logger.error('Withdrawal execution failed', {
        withdrawalHash,
        user,
        error: errorMsg,
      });

      return result;
    }
  }

  /**
   * Simulate withdrawal execution (dry run)
   */
  async simulateWithdrawal(
    user: string,
    amount: bigint,
    withdrawalHash: string
  ): Promise<ExecutionResult> {
    try {
      this.logger.info('Simulating withdrawal execution', {
        user,
        amount: amount.toString(),
        withdrawalHash,
      });

      // Simulate the call
      await this.contract.completeWithdrawal.staticCall(user, amount, withdrawalHash);

      const result: ExecutionResult = {
        success: true,
      };

      this.logger.info('Withdrawal simulation successful', { withdrawalHash });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const result: ExecutionResult = {
        success: false,
        error: errorMsg,
      };

      this.logger.error('Withdrawal simulation failed', {
        withdrawalHash,
        error: errorMsg,
      });

      return result;
    }
  }

  /**
   * Get execution status
   */
  getExecutionStatus(withdrawalHash: string): ExecutionResult | null {
    return this.executionHistory.get(withdrawalHash) || null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory() {
    return {
      total: this.executionHistory.size,
      executions: Array.from(this.executionHistory.entries()).map(([hash, result]) => ({
        withdrawalHash: hash,
        ...result,
      })),
    };
  }

  /**
   * Get executor address
   */
  getExecutorAddress(): string {
    return this.signer.address;
  }

  /**
   * Check if executor has sufficient balance for gas
   */
  async checkGasBalance(minBalance?: bigint): Promise<boolean> {
    try {
      const balance = await this.provider.getBalance(this.signer.address);
      const required = minBalance || BigInt('1000000000000000000'); // 1 token default

      const hasSufficientBalance = balance >= required;

      if (!hasSufficientBalance) {
        this.logger.warn('Insufficient gas balance', {
          balance: balance.toString(),
          required: required.toString(),
        });
      }

      return hasSufficientBalance;
    } catch (error) {
      this.logger.error('Error checking gas balance', error);
      return false;
    }
  }

  /**
   * Estimate gas for withdrawal execution
   */
  async estimateGas(
    user: string,
    amount: bigint,
    withdrawalHash: string
  ): Promise<bigint | null> {
    try {
      const gasEstimate = await this.contract.completeWithdrawal.estimateGas(
        user,
        amount,
        withdrawalHash
      );

      this.logger.debug('Gas estimate calculated', {
        user,
        amount: amount.toString(),
        gasEstimate: gasEstimate.toString(),
      });

      return gasEstimate;
    } catch (error) {
      this.logger.error('Error estimating gas', error);
      return null;
    }
  }
}
