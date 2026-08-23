/**
 * Deposit Executor
 * Executes completeDeposit on BridgeL2 to mint tokens for users
 * Called after collecting required signatures from validators
 */

import { Contract, Wallet, JsonRpcProvider, TransactionResponse } from 'ethers';
import type { ExecutionResult, NetworkConfig, Logger, SignatureData } from '../types/index.js';
import { BRIDGE_L2_ABI } from '../config/abis.js';

export class DepositExecutor {
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
      BRIDGE_L2_ABI,
      this.signer
    );

    this.logger.info('DepositExecutor initialized', {
      network: networkConfig.name,
      executorAddress: this.signer.address,
      bridgeAddress: networkConfig.bridgeAddress,
    });
  }

  /**
   * Execute completeDeposit on BridgeL2
   */
  async executeDeposit(
    user: string,
    amount: bigint,
    depositHash: string,
    signatures?: SignatureData[]
  ): Promise<ExecutionResult> {
    try {
      this.logger.info('Executing deposit on L2', {
        user,
        amount: amount.toString(),
        depositHash,
        signatureCount: signatures?.length || 0,
      });

      // Check if already executed
      if (this.executionHistory.has(depositHash)) {
        const result = this.executionHistory.get(depositHash)!;
        this.logger.warn('Deposit already executed', {
          depositHash,
          transactionHash: result.transactionHash,
        });
        return result;
      }

      // Call completeDeposit on BridgeL2
      const tx: TransactionResponse = await this.contract.completeDeposit(
        user,
        amount,
        depositHash
      );

      this.logger.info('Deposit transaction submitted', {
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

      this.executionHistory.set(depositHash, result);

      this.logger.info('Deposit executed successfully', {
        depositHash,
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

      this.logger.error('Deposit execution failed', {
        depositHash,
        user,
        error: errorMsg,
      });

      return result;
    }
  }

  /**
   * Simulate deposit execution (dry run)
   */
  async simulateDeposit(
    user: string,
    amount: bigint,
    depositHash: string
  ): Promise<ExecutionResult> {
    try {
      this.logger.info('Simulating deposit execution', {
        user,
        amount: amount.toString(),
        depositHash,
      });

      // Simulate the call
      await this.contract.completeDeposit.staticCall(user, amount, depositHash);

      const result: ExecutionResult = {
        success: true,
      };

      this.logger.info('Deposit simulation successful', { depositHash });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const result: ExecutionResult = {
        success: false,
        error: errorMsg,
      };

      this.logger.error('Deposit simulation failed', {
        depositHash,
        error: errorMsg,
      });

      return result;
    }
  }

  /**
   * Get execution status
   */
  getExecutionStatus(depositHash: string): ExecutionResult | null {
    return this.executionHistory.get(depositHash) || null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory() {
    return {
      total: this.executionHistory.size,
      executions: Array.from(this.executionHistory.entries()).map(([hash, result]) => ({
        depositHash: hash,
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
   * Estimate gas for deposit execution
   */
  async estimateGas(
    user: string,
    amount: bigint,
    depositHash: string
  ): Promise<bigint | null> {
    try {
      const gasEstimate = await this.contract.completeDeposit.estimateGas(
        user,
        amount,
        depositHash
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
