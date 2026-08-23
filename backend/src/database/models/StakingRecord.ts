/**
 * StakingRecord Model
 * Represents staking activities and rewards
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface StakingRecordAttributes {
  id: string;
  validatorAddress: string;
  userAddress: string;
  amount: string; // wei
  type: 'stake' | 'unstake' | 'reward' | 'slash' | 'redeposit';
  txHash: string;
  blockNumber: number;
  rewardsEarned?: string;
  rewardsClaimed?: string;
  lastRewardBlock?: number;
  status: 'pending' | 'confirmed' | 'claimed' | 'slashed';
  createdAt: Date;
  updatedAt: Date;
}

interface StakingRecordCreationAttributes extends Optional<StakingRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class StakingRecord extends Model<StakingRecordAttributes, StakingRecordCreationAttributes> implements StakingRecordAttributes {
  public id!: string;
  public validatorAddress!: string;
  public userAddress!: string;
  public amount!: string;
  public type!: 'stake' | 'unstake' | 'reward' | 'slash' | 'redeposit';
  public txHash!: string;
  public blockNumber!: number;
  public rewardsEarned?: string;
  public rewardsClaimed?: string;
  public lastRewardBlock?: number;
  public status!: 'pending' | 'confirmed' | 'claimed' | 'slashed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StakingRecord.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    validatorAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    userAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('stake', 'unstake', 'reward', 'slash', 'redeposit'),
      allowNull: false,
    },
    txHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rewardsEarned: {
      type: DataTypes.DECIMAL(40, 0),
      defaultValue: '0',
    },
    rewardsClaimed: {
      type: DataTypes.DECIMAL(40, 0),
      defaultValue: '0',
    },
    lastRewardBlock: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'claimed', 'slashed'),
      defaultValue: 'pending',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'staking_records',
    timestamps: true,
    indexes: [
      { fields: ['validatorAddress'] },
      { fields: ['userAddress'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['blockNumber'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default StakingRecord;
