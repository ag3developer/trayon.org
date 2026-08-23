/**
 * BaseService
 * Abstract base class for all services with common CRUD operations
 */

import { Model, ModelStatic, FindOptions, CreateOptions, UpdateOptions } from 'sequelize';
import Logger from '../utils/logger';

export abstract class BaseService<M extends Model> {
  protected logger: Logger;
  protected model: ModelStatic<M>;

  constructor(model: ModelStatic<M>, serviceName: string) {
    this.model = model;
    this.logger = new Logger(serviceName);
  }

  /**
   * Find all records
   */
  async findAll(options?: FindOptions<M>) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      this.logger.error('Error finding all records:', error);
      throw error;
    }
  }

  /**
   * Find one record by primary key
   */
  async findById(id: any, options?: FindOptions<M>) {
    try {
      return await this.model.findByPk(id, options);
    } catch (error) {
      this.logger.error('Error finding record by ID:', error);
      throw error;
    }
  }

  /**
   * Find one record by custom options
   */
  async findOne(options: FindOptions<M>) {
    try {
      return await this.model.findOne(options);
    } catch (error) {
      this.logger.error('Error finding one record:', error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(options?: FindOptions<M>) {
    try {
      return await this.model.count(options);
    } catch (error) {
      this.logger.error('Error counting records:', error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: any, options?: CreateOptions<M>) {
    try {
      const record = await this.model.create(data, options);
      this.logger.info(`Record created: ${record.id || record.get('id')}`);
      return record;
    } catch (error) {
      this.logger.error('Error creating record:', error);
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id: any, data: any, options?: UpdateOptions<M>) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error(`Record not found: ${id}`);
      }
      await record.update(data, options);
      this.logger.info(`Record updated: ${id}`);
      return record;
    } catch (error) {
      this.logger.error('Error updating record:', error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: any, options?: any) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error(`Record not found: ${id}`);
      }
      await record.destroy(options);
      this.logger.info(`Record deleted: ${id}`);
      return true;
    } catch (error) {
      this.logger.error('Error deleting record:', error);
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data: any[], options?: CreateOptions<M>) {
    try {
      const records = await this.model.bulkCreate(data, options);
      this.logger.info(`${records.length} records created in bulk`);
      return records;
    } catch (error) {
      this.logger.error('Error bulk creating records:', error);
      throw error;
    }
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(data: any[], options?: UpdateOptions<M>) {
    try {
      const result = await this.model.update(data, options);
      this.logger.info(`Bulk update completed: ${result[0]} records affected`);
      return result;
    } catch (error) {
      this.logger.error('Error bulk updating records:', error);
      throw error;
    }
  }
}
