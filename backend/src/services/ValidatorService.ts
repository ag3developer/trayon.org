/**
 * ValidatorService
 * Business logic for validator operations
 */

import { BaseService } from './BaseService';
import { Validator } from '../database/models';
import Logger from '../utils/logger';

export class ValidatorService extends BaseService<typeof Validator> {
  constructor() {
    super(Validator, 'ValidatorService');
  }

  /**
   * Find validator by address
   */
  async findByAddress(address: string) {
    try {
      return await this.findOne({ where: { address: address.toLowerCase() } });
    } catch (error) {
      this.logger.error(`Error finding validator by address:`, error);
      throw error;
    }
  }

  /**
   * Get active validators
   */
  async getActiveValidators(limit: number = 100) {
    try {
      return await this.findAll({
        where: { status: 'active' },
        limit,
        order: [['stakedAmount', 'DESC']],
      });
    } catch (error) {
      this.logger.error('Error fetching active validators:', error);
      throw error;
    }
  }

  /**
   * Calculate validator metrics
   */
  async getValidatorMetrics(address: string) {
    try {
      const validator = await this.findByAddress(address);
      if (!validator) throw new Error('Validator not found');

      const totalProposals = validator.successfulProposals + validator.failedProposals;
      const successRate = totalProposals > 0 ? (validator.successfulProposals / totalProposals) * 100 : 0;

      return {
        address: validator.address,
        status: validator.status,
        stakedAmount: validator.stakedAmount,
        commission: validator.commission,
        uptime: validator.uptime,
        successRate: successRate.toFixed(2),
        totalProposals,
        successfulProposals: validator.successfulProposals,
        failedProposals: validator.failedProposals,
      };
    } catch (error) {
      this.logger.error('Error calculating validator metrics:', error);
      throw error;
    }
  }

  /**
   * Slash a validator
   */
  async slashValidator(address: string, amount: string, reason: string) {
    try {
      const validator = await this.findByAddress(address);
      if (!validator) throw new Error('Validator not found');

      const currentStaked = BigInt(validator.stakedAmount);
      const slashAmount = BigInt(amount);
      const newStaked = (currentStaked - slashAmount).toString();

      // If slashed too much, jail the validator
      const shouldJail = newStaked === '0' || newStaked === '-' + slashAmount.toString();
      const jailedUntil = shouldJail ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null; // 7 days

      await validator.update({
        stakedAmount: newStaked,
        status: shouldJail ? 'slashed' : 'active',
        jailedUntil,
      });

      this.logger.warn(`Validator slashed: ${address}, amount: ${amount}, reason: ${reason}`);
      return validator;
    } catch (error) {
      this.logger.error('Error slashing validator:', error);
      throw error;
    }
  }

  /**
   * Unjail a validator
   */
  async unjailValidator(address: string) {
    try {
      const validator = await this.findByAddress(address);
      if (!validator) throw new Error('Validator not found');

      const now = new Date();
      if (validator.jailedUntil && validator.jailedUntil > now) {
        throw new Error('Validator is still jailed');
      }

      await validator.update({
        status: 'active',
        jailedUntil: null,
      });

      this.logger.info(`Validator unjailed: ${address}`);
      return validator;
    } catch (error) {
      this.logger.error('Error unjailing validator:', error);
      throw error;
    }
  }

  /**
   * Update validator heartbeat
   */
  async updateHeartbeat(address: string) {
    try {
      const validator = await this.findByAddress(address);
      if (!validator) throw new Error('Validator not found');

      await validator.update({ lastHeartbeat: new Date() });
      return validator;
    } catch (error) {
      this.logger.error('Error updating heartbeat:', error);
      throw error;
    }
  }
}

export default new ValidatorService();
