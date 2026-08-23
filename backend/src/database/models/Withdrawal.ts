/**
 * Withdrawal Model
 * Represents L2 → L1 withdrawal transactions
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface WithdrawalAttributes {
  id: string;
  userAddress: string;
  amount: string; // wei
  token: string; // Token address
  l2TxHash: string;
  l2BlockNumber: number;
  l1TxHash?: string;
  status: 'pending' | 'submitted' | 'proven' | 'finalized' | 'failed';
  challengeWindow?: Date;
  provenAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WithdrawalCreationAttributes extends Optional<WithdrawalAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: string;
  public userAddress!: string;
  public amount!: string;
  public token!: string;
  public l2TxHash!: string;
  public l2BlockNumber!: number;
  public l1TxHash?: string;
  public status!: 'pending' | 'submitted' | 'proven' | 'finalized' | 'failed';
  public challengeWindow?: Date;
  public provenAt?: Date;
  public failureReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Withdrawal.init(
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
    l2TxHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      unique: true,
    },
    l2BlockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    l1TxHash: {
      type: DataTypes.STRING(66),
    },
    status: {
      type: DataTypes.ENUM('pending', 'submitted', 'proven', 'finalized', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    challengeWindow: {
      type: DataTypes.DATE,
    },
    provenAt: {
      type: DataTypes.DATE,
    },
    failureReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'withdrawals',
    timestamps: true,
    indexes: [
      { fields: ['userAddress'] },
      { fields: ['l2TxHash'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Withdrawal;
