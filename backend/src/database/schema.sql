-- Trayon Backend Database Schema
-- PostgreSQL

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Validators Table
CREATE TABLE validators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255),
  stake NUMERIC(78, 0) DEFAULT 0,
  reputation INT DEFAULT 100,
  status VARCHAR(20) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits Table
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  tx_hash VARCHAR(66) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Withdrawals Table
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  tx_hash VARCHAR(66) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42),
  amount NUMERIC(78, 0),
  type VARCHAR(50),
  status VARCHAR(20),
  block_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocks Table
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_number INT UNIQUE NOT NULL,
  block_hash VARCHAR(66) UNIQUE NOT NULL,
  parent_hash VARCHAR(66),
  proposer_address VARCHAR(42),
  timestamp BIGINT,
  transaction_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Balances Table
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) UNIQUE NOT NULL,
  balance NUMERIC(78, 0) DEFAULT 0,
  staked NUMERIC(78, 0) DEFAULT 0,
  pending_withdrawal NUMERIC(78, 0) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rewards Table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validator_address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  block_height INT,
  distribution_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  claimed_at TIMESTAMP
);

-- Slashings Table
CREATE TABLE slashings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validator_address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table (for validators)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validator_address VARCHAR(42) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX idx_validators_address ON validators(address);
CREATE INDEX idx_validators_status ON validators(status);
CREATE INDEX idx_deposits_user ON deposits(user_address);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_address);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
CREATE INDEX idx_blocks_number ON blocks(block_number);
CREATE INDEX idx_blocks_proposer ON blocks(proposer_address);
CREATE INDEX idx_rewards_validator ON rewards(validator_address);
CREATE INDEX idx_slashings_validator ON slashings(validator_address);
