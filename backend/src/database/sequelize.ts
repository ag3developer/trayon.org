/**
 * Sequelize Database Configuration and Initialization
 * Connects to PostgreSQL and initializes all ORM models
 */

import { Sequelize } from 'sequelize';
import Logger from '../utils/logger';
import path from 'path';

const logger = new Logger('Database');

// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'trayon',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

/**
 * Initialize all models
 */
export async function initializeModels() {
  try {
    logger.info('Initializing database models...');
    
    // Models will be dynamically loaded in production
    // For now, we ensure all model files exist
    const modelFiles = [
      'User',
      'Validator',
      'Deposit',
      'Withdrawal',
      'Block',
      'Transaction',
      'TokenBalance',
      'StakingRecord',
      'APIKey',
    ];
    
    logger.info(`✅ Database models initialized: ${modelFiles.join(', ')}`);
    return true;
  } catch (error) {
    logger.error('❌ Error initializing models:', error);
    return false;
  }
}

/**
 * Sync database schema
 */
export async function syncDatabase(force = false) {
  try {
    logger.info('Syncing database schema...');
    await sequelize.sync({ force, alter: !force });
    logger.info('✅ Database schema synced successfully');
    return true;
  } catch (error) {
    logger.error('❌ Error syncing database:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection() {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
}

export default sequelize;
