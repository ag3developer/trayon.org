/**
 * BridgeService
 * Business logic for bridge/deposit/withdrawal operations
 */

import { BaseService } from './BaseService';
import { Deposit, Withdrawal } from '../database/models';
import Logger from '../utils/logger';

export class BridgeService {
  private depositService: BaseService<typeof Deposit>;
  private withdrawalService: BaseService<typeof Withdrawal>;
  private logger: Logger;

  constructor() {
    this.depositService = new BaseService(Deposit, 'DepositService');
    this.withdrawalService = new BaseService(Withdrawal, 'WithdrawalService');
    this.logger = new Logger('BridgeService');
  }

  /**
   * Get pending deposits
   */
  async getPendingDeposits(limit: number = 50) {
    try {
      return await Deposit.findAll({
        where: { status: 'pending' },
        limit,
        order: [['createdAt', 'ASC']],
      });
    } catch (error) {
      this.logger.error('Error fetching pending deposits:', error);
      throw error;
    }
  }

  /**
   * Get pending withdrawals
   */
  async getPendingWithdrawals(limit: number = 50) {
    try {
      return await Withdrawal.findAll({
        where: { status: 'pending' },
        limit,
        order: [['createdAt', 'ASC']],
      });
    } catch (error) {
      this.logger.error('Error fetching pending withdrawals:', error);
      throw error;
    }
  }

  /**
   * Track deposit status by L1 tx hash
   */
  async getDepositStatus(l1TxHash: string) {
    try {
      const deposit = await Deposit.findOne({ where: { l1TxHash } });
      if (!deposit) throw new Error('Deposit not found');
      return deposit;
    } catch (error) {
      this.logger.error('Error getting deposit status:', error);
      throw error;
    }
  }

  /**
   * Track withdrawal status by L2 tx hash
   */
  async getWithdrawalStatus(l2TxHash: string) {
    try {
      const withdrawal = await Withdrawal.findOne({ where: { l2TxHash } });
      if (!withdrawal) throw new Error('Withdrawal not found');
      return withdrawal;
    } catch (error) {
      this.logger.error('Error getting withdrawal status:', error);
      throw error;
    }
  }

  /**
   * Confirm deposit
   */
  async confirmDeposit(l1TxHash: string, l2TxHash: string, blockNumber: number) {
    try {
      const deposit = await Deposit.findOne({ where: { l1TxHash } });
      if (!deposit) throw new Error('Deposit not found');

      await deposit.update({
        l2TxHash,
        status: 'finalized',
        confirmations: Math.max(deposit.confirmations, 12), // 12 blocks confirmation
      });

      this.logger.info(`Deposit confirmed: ${l1TxHash}`);
      return deposit;
    } catch (error) {
      this.logger.error('Error confirming deposit:', error);
      throw error;
    }
  }

  /**
   * Prove withdrawal on L1
   */
  async proveWithdrawal(l2TxHash: string) {
    try {
      const withdrawal = await Withdrawal.findOne({ where: { l2TxHash } });
      if (!withdrawal) throw new Error('Withdrawal not found');

      // Challenge window is 7 days from L2 transaction
      const challengeWindow = new Date(new Date(withdrawal.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);

      await withdrawal.update({
        status: 'proven',
        provenAt: new Date(),
        challengeWindow,
      });

      this.logger.info(`Withdrawal proven: ${l2TxHash}`);
      return withdrawal;
    } catch (error) {
      this.logger.error('Error proving withdrawal:', error);
      throw error;
    }
  }

  /**
   * Finalize withdrawal on L1
   */
  async finalizeWithdrawal(l2TxHash: string, l1TxHash: string) {
    try {
      const withdrawal = await Withdrawal.findOne({ where: { l2TxHash } });
      if (!withdrawal) throw new Error('Withdrawal not found');

      const now = new Date();
      if (withdrawal.challengeWindow && now < withdrawal.challengeWindow) {
        throw new Error('Withdrawal is still in challenge window');
      }

      await withdrawal.update({
        l1TxHash,
        status: 'finalized',
      });

      this.logger.info(`Withdrawal finalized: ${l2TxHash}`);
      return withdrawal;
    } catch (error) {
      this.logger.error('Error finalizing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats() {
    try {
      const totalDeposits = await Deposit.count();
      const totalWithdrawals = await Withdrawal.count();
      const pendingDeposits = await Deposit.count({ where: { status: 'pending' } });
      const pendingWithdrawals = await Withdrawal.count({ where: { status: 'pending' } });

      const totalDepositedAmount = await Deposit.sum('amount', { where: { status: 'finalized' } }) || '0';
      const totalWithdrawnAmount = await Withdrawal.sum('amount', { where: { status: 'finalized' } }) || '0';

      return {
        totalDeposits,
        totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        totalDepositedAmount,
        totalWithdrawnAmount,
        netFlow: (BigInt(totalDepositedAmount) - BigInt(totalWithdrawnAmount)).toString(),
      };
    } catch (error) {
      this.logger.error('Error getting bridge stats:', error);
      throw error;
    }
  }
}

export default new BridgeService();
