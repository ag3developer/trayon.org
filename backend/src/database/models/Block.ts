/**
 * Block Model
 * Represents blocks in the Trayon blockchain
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface BlockAttributes {
  id: string;
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  stateRoot: string;
  transactionsRoot: string;
  timestamp: Date;
  proposer: string; // Validator address
  gasUsed: string;
  gasLimit: string;
  transactions: number; // Count of transactions
  size: number; // Block size in bytes
  finalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlockCreationAttributes extends Optional<BlockAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Block extends Model<BlockAttributes, BlockCreationAttributes> implements BlockAttributes {
  public id!: string;
  public blockNumber!: number;
  public blockHash!: string;
  public parentHash!: string;
  public stateRoot!: string;
  public transactionsRoot!: string;
  public timestamp!: Date;
  public proposer!: string;
  public gasUsed!: string;
  public gasLimit!: string;
  public transactions!: number;
  public size!: number;
  public finalized!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Block.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    blockHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      unique: true,
    },
    parentHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
    stateRoot: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
    transactionsRoot: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    proposer: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    gasLimit: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    transactions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    size: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    finalized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'blocks',
    timestamps: true,
    indexes: [
      { fields: ['blockNumber'] },
      { fields: ['blockHash'] },
      { fields: ['timestamp'] },
      { fields: ['proposer'] },
      { fields: ['finalized'] },
    ],
  }
);

export default Block;
