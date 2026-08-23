/**
 * User Model
 * Represents platform users and their account data
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

interface UserAttributes {
  id: string;
  address: string;
  email?: string;
  username?: string;
  role: 'user' | 'validator' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  passwordHash?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public address!: string;
  public email?: string;
  public username?: string;
  public role!: 'user' | 'validator' | 'admin';
  public status!: 'active' | 'inactive' | 'suspended';
  public passwordHash?: string;
  public twoFactorEnabled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
      validate: {
        isHexadecimal: true,
        len: [42, 42], // 0x + 40 hex chars
      },
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'validator', 'admin'),
      defaultValue: 'user',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['address'] },
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['role'] },
      { fields: ['status'] },
    ],
  }
);

export default User;
