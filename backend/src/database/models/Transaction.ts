/**
 * Transaction Model
 * Represents transactions on the Trayon network
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface TransactionAttributes {
  id: string;
  txHash: string;
  from: string;
  to?: string;
  value: string; // wei
  gasPrice: string;
  gas: string;
  gasUsed?: string;
  input: string; // Transaction data
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'transfer' | 'deposit' | 'withdrawal' | 'stake' | 'unstake' | 'contract' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public txHash!: string;
  public from!: string;
  public to?: string;
  public value!: string;
  public gasPrice!: string;
  public gas!: string;
  public gasUsed?: string;
  public input!: string;
  public blockNumber?: number;
  public blockHash?: string;
  public transactionIndex?: number;
  public status!: 'pending' | 'confirmed' | 'failed';
  public type!: 'transfer' | 'deposit' | 'withdrawal' | 'stake' | 'unstake' | 'contract' | 'other';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    txHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      unique: true,
    },
    from: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING(42),
    },
    value: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    gasPrice: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
    },
    gas: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.DECIMAL(40, 0),
    },
    input: {
      type: DataTypes.TEXT,
      defaultValue: '0x',
    },
    blockNumber: {
      type: DataTypes.INTEGER,
    },
    blockHash: {
      type: DataTypes.STRING(66),
    },
    transactionIndex: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('transfer', 'deposit', 'withdrawal', 'stake', 'unstake', 'contract', 'other'),
      defaultValue: 'other',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['txHash'] },
      { fields: ['from'] },
      { fields: ['to'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['blockNumber'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Transaction;
