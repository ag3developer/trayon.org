/**
 * APIKey Model
 * Represents API keys for authentication
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import crypto from 'crypto';

interface APIKeyAttributes {
  id: string;
  userAddress: string;
  keyHash: string;
  keyPrefix: string; // First 8 chars for easy identification
  name: string;
  permissions: string[]; // JSON array of permissions
  rateLimit?: number; // Requests per minute
  status: 'active' | 'revoked' | 'expired';
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface APIKeyCreationAttributes extends Optional<APIKeyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class APIKey extends Model<APIKeyAttributes, APIKeyCreationAttributes> implements APIKeyAttributes {
  public id!: string;
  public userAddress!: string;
  public keyHash!: string;
  public keyPrefix!: string;
  public name!: string;
  public permissions!: string[];
  public rateLimit?: number;
  public status!: 'active' | 'revoked' | 'expired';
  public lastUsed?: Date;
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Generate a new API key
   */
  static generateKey(): { key: string; prefix: string; hash: string } {
    const key = crypto.randomBytes(32).toString('hex');
    const prefix = key.substring(0, 8);
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, prefix, hash };
  }

  /**
   * Verify a raw key against the stored hash
   */
  verifyKey(rawKey: string): boolean {
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
    return hash === this.keyHash;
  }
}

APIKey.init(
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
    keyHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    keyPrefix: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['read:public'],
    },
    rateLimit: {
      type: DataTypes.INTEGER,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.ENUM('active', 'revoked', 'expired'),
      defaultValue: 'active',
      allowNull: false,
    },
    lastUsed: {
      type: DataTypes.DATE,
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'api_keys',
    timestamps: true,
    indexes: [
      { fields: ['userAddress'] },
      { fields: ['keyHash'] },
      { fields: ['keyPrefix'] },
      { fields: ['status'] },
      { fields: ['expiresAt'] },
    ],
  }
);

export default APIKey;
