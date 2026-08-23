/**
 * Database Models Index
 * Exports all ORM models for central access
 */

import User from './User';
import Validator from './Validator';
import Deposit from './Deposit';
import Withdrawal from './Withdrawal';
import Block from './Block';
import Transaction from './Transaction';
import TokenBalance from './TokenBalance';
import StakingRecord from './StakingRecord';
import APIKey from './APIKey';

/**
 * Initialize model associations
 */
export function initializeAssociations() {
  // User has many transactions (as sender)
  User.hasMany(Transaction, { foreignKey: 'from', sourceKey: 'address', as: 'sentTransactions' });
  Transaction.belongsTo(User, { foreignKey: 'from', targetKey: 'address', as: 'sender' });

  // User has many deposits
  User.hasMany(Deposit, { foreignKey: 'userAddress', sourceKey: 'address' });
  Deposit.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'address' });

  // User has many withdrawals
  User.hasMany(Withdrawal, { foreignKey: 'userAddress', sourceKey: 'address' });
  Withdrawal.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'address' });

  // User has many token balances
  User.hasMany(TokenBalance, { foreignKey: 'userAddress', sourceKey: 'address' });
  TokenBalance.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'address' });

  // Validator has many blocks (as proposer)
  Validator.hasMany(Block, { foreignKey: 'proposer', sourceKey: 'address', as: 'proposedBlocks' });
  Block.belongsTo(Validator, { foreignKey: 'proposer', targetKey: 'address', as: 'proposer_validator' });

  // Validator has many staking records
  Validator.hasMany(StakingRecord, { foreignKey: 'validatorAddress', sourceKey: 'address' });
  StakingRecord.belongsTo(Validator, { foreignKey: 'validatorAddress', targetKey: 'address' });

  // User has many staking records
  User.hasMany(StakingRecord, { foreignKey: 'userAddress', sourceKey: 'address' });
  StakingRecord.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'address' });

  // Block has many transactions
  Block.hasMany(Transaction, { foreignKey: 'blockHash', sourceKey: 'blockHash' });
  Transaction.belongsTo(Block, { foreignKey: 'blockHash', targetKey: 'blockHash' });

  // User has many API keys
  User.hasMany(APIKey, { foreignKey: 'userAddress', sourceKey: 'address' });
  APIKey.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'address' });
}

// Export all models
export {
  User,
  Validator,
  Deposit,
  Withdrawal,
  Block,
  Transaction,
  TokenBalance,
  StakingRecord,
  APIKey,
};

export default {
  User,
  Validator,
  Deposit,
  Withdrawal,
  Block,
  Transaction,
  TokenBalance,
  StakingRecord,
  APIKey,
  initializeAssociations,
};
