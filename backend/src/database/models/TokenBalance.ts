/**
 * TokenBalance Model
 * Represents user token balances
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface TokenBalanceAttributes {
  id: string;
  userAddress: string;
  tokenAddress: string;
  balance: string; // Token amount (wei)
  locked: string; // Locked amount for staking
  available: string; // Available for transfer (computed)
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TokenBalanceCreationAttributes extends Optional<TokenBalanceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class TokenBalance extends Model<TokenBalanceAttributes, TokenBalanceCreationAttributes> implements TokenBalanceAttributes {
  public id!: string;
  public userAddress!: string;
  public tokenAddress!: string;
  public balance!: string;
  public locked!: string;
  public available!: string;
  public lastUpdated!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TokenBalance.init(
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
    tokenAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    locked: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    available: {
      type: DataTypes.VIRTUAL,
      get() {
        // Computed: available = balance - locked
        const balance = BigInt(this.getDataValue('balance') || '0');
        const locked = BigInt(this.getDataValue('locked') || '0');
        return (balance - locked).toString();
      },
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'token_balances',
    timestamps: true,
    indexes: [
      { fields: ['userAddress', 'tokenAddress'], unique: true },
      { fields: ['userAddress'] },
      { fields: ['tokenAddress'] },
      { fields: ['lastUpdated'] },
    ],
  }
);

export default TokenBalance;
