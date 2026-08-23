/**
 * Validator Model
 * Represents validators in the PBFT consensus network
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface ValidatorAttributes {
  id: string;
  address: string;
  publicKey: string;
  status: 'active' | 'inactive' | 'slashed';
  stakedAmount: string; // BigInt as string (wei)
  commission: number; // Percentage 0-100
  uptime: number; // Percentage
  successfulProposals: number;
  failedProposals: number;
  jailedUntil?: Date;
  lastHeartbeat: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ValidatorCreationAttributes extends Optional<ValidatorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Validator extends Model<ValidatorAttributes, ValidatorCreationAttributes> implements ValidatorAttributes {
  public id!: string;
  public address!: string;
  public publicKey!: string;
  public status!: 'active' | 'inactive' | 'slashed';
  public stakedAmount!: string;
  public commission!: number;
  public uptime!: number;
  public successfulProposals!: number;
  public failedProposals!: number;
  public jailedUntil?: Date;
  public lastHeartbeat!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Validator.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING(42),
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'slashed'),
      defaultValue: 'inactive',
      allowNull: false,
    },
    stakedAmount: {
      type: DataTypes.DECIMAL(40, 0),
      allowNull: false,
      defaultValue: '0',
    },
    commission: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    uptime: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
      validate: { min: 0, max: 100 },
    },
    successfulProposals: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedProposals: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    jailedUntil: {
      type: DataTypes.DATE,
    },
    lastHeartbeat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'validators',
    timestamps: true,
    indexes: [
      { fields: ['address'] },
      { fields: ['status'] },
      { fields: ['lastHeartbeat'] },
    ],
  }
);

export default Validator;
