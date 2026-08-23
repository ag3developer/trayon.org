/**
 * Deposit Model
 * Represents L1 → L2 deposit transactions
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface DepositAttributes {
  id: string;
  userAddress: string;
  amount: string; // wei
  token: string; // Token address
  l1TxHash: string;
  l1BlockNumber: number;
  l2TxHash?: string;
  status: 'pending' | 'confirmed' | 'finalized' | 'failed';
  confirmations: number;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DepositCreationAttributes extends Optional<DepositAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Deposit extends Model<DepositAttributes, DepositCreationAttributes> implements DepositAttributes {
  public id!: string;
  public userAddress!: string;
  public amount!: string;
  public token!: string;
  public l1TxHash!: string;
  public l1BlockNumber!: number;
  public l2TxHash?: string;
  public status!: 'pending' | 'confirmed' | 'finalized' | 'failed';
  public confirmations!: number;
  public failureReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Deposit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    l1TxHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      unique: true,
    },
    l1BlockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    l2TxHash: {
      type: DataTypes.STRING(66),
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'finalized', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    confirmations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failureReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'deposits',
    timestamps: true,
    indexes: [
      { fields: ['userAddress'] },
      { fields: ['l1TxHash'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Deposit;
