/**
 * UserService
 * Business logic for user operations
 */

import { BaseService } from './BaseService';
import { User } from '../database/models';
import { Op } from 'sequelize';
import Logger from '../utils/logger';

export class UserService extends BaseService<typeof User> {
  constructor() {
    super(User, 'UserService');
  }

  /**
   * Find user by wallet address
   */
  async findByAddress(address: string) {
    try {
      return await this.findOne({ where: { address: address.toLowerCase() } });
    } catch (error) {
      this.logger.error(`Error finding user by address ${address}:`, error);
      throw error;
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string) {
    try {
      return await this.findOne({ where: { username } });
    } catch (error) {
      this.logger.error(`Error finding user by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Find or create user by address
   */
  async findOrCreateByAddress(address: string, data?: any) {
    try {
      const normalizedAddress = address.toLowerCase();
      const [user, created] = await User.findOrCreate({
        where: { address: normalizedAddress },
        defaults: {
          role: 'user',
          status: 'active',
          twoFactorEnabled: false,
          ...data,
        },
      });
      if (created) {
        this.logger.info(`New user created: ${address}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding or creating user by address:`, error);
      throw error;
    }
  }

  /**
   * Get validators
   */
  async getValidators(limit: number = 10, offset: number = 0) {
    try {
      const { count, rows } = await User.findAndCountAll({
        where: { role: 'validator' },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { total: count, validators: rows };
    } catch (error) {
      this.logger.error('Error fetching validators:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateStatus(address: string, status: 'active' | 'inactive' | 'suspended') {
    try {
      const user = await this.findByAddress(address);
      if (!user) throw new Error('User not found');
      await user.update({ status });
      return user;
    } catch (error) {
      this.logger.error(`Error updating user status:`, error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(address: string) {
    try {
      const user = await this.findByAddress(address);
      if (!user) throw new Error('User not found');

      return {
        id: user.id,
        address: user.address,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error fetching user stats:`, error);
      throw error;
    }
  }
}

export default new UserService();
