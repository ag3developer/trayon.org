-- Trayon Database Initial Schema
-- This migration creates all tables for the Trayon backend

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  role ENUM('user', 'validator', 'admin') DEFAULT 'user' NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' NOT NULL,
  "passwordHash" VARCHAR(255),
  "twoFactorEnabled" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- Validators Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(42) UNIQUE NOT NULL,
  "publicKey" TEXT NOT NULL,
  status ENUM('active', 'inactive', 'slashed') DEFAULT 'inactive' NOT NULL,
  "stakedAmount" DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  commission FLOAT DEFAULT 0,
  uptime FLOAT DEFAULT 100,
  "successfulProposals" INTEGER DEFAULT 0,
  "failedProposals" INTEGER DEFAULT 0,
  "jailedUntil" TIMESTAMP,
  "lastHeartbeat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validators_address ON validators(address);
CREATE INDEX idx_validators_status ON validators(status);
CREATE INDEX idx_validators_lastHeartbeat ON validators("lastHeartbeat");

-- ============================================================================
-- Deposits Table (L1 → L2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userAddress" VARCHAR(42) NOT NULL,
  amount DECIMAL(40, 0) NOT NULL,
  token VARCHAR(42) NOT NULL,
  "l1TxHash" VARCHAR(66) UNIQUE NOT NULL,
  "l1BlockNumber" INTEGER NOT NULL,
  "l2TxHash" VARCHAR(66),
  status ENUM('pending', 'confirmed', 'finalized', 'failed') DEFAULT 'pending' NOT NULL,
  confirmations INTEGER DEFAULT 0,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deposits_userAddress ON deposits("userAddress");
CREATE INDEX idx_deposits_l1TxHash ON deposits("l1TxHash");
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_createdAt ON deposits("createdAt");

-- ============================================================================
-- Withdrawals Table (L2 → L1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userAddress" VARCHAR(42) NOT NULL,
  amount DECIMAL(40, 0) NOT NULL,
  token VARCHAR(42) NOT NULL,
  "l2TxHash" VARCHAR(66) UNIQUE NOT NULL,
  "l2BlockNumber" INTEGER NOT NULL,
  "l1TxHash" VARCHAR(66),
  status ENUM('pending', 'submitted', 'proven', 'finalized', 'failed') DEFAULT 'pending' NOT NULL,
  "challengeWindow" TIMESTAMP,
  "provenAt" TIMESTAMP,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawals_userAddress ON withdrawals("userAddress");
CREATE INDEX idx_withdrawals_l2TxHash ON withdrawals("l2TxHash");
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_createdAt ON withdrawals("createdAt");

-- ============================================================================
-- Blocks Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "blockNumber" INTEGER UNIQUE NOT NULL,
  "blockHash" VARCHAR(66) UNIQUE NOT NULL,
  "parentHash" VARCHAR(66) NOT NULL,
  "stateRoot" VARCHAR(66) NOT NULL,
  "transactionsRoot" VARCHAR(66) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  proposer VARCHAR(42) NOT NULL,
  "gasUsed" DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  "gasLimit" DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  transactions INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  finalized BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blocks_blockNumber ON blocks("blockNumber");
CREATE INDEX idx_blocks_blockHash ON blocks("blockHash");
CREATE INDEX idx_blocks_timestamp ON blocks(timestamp);
CREATE INDEX idx_blocks_proposer ON blocks(proposer);
CREATE INDEX idx_blocks_finalized ON blocks(finalized);

-- ============================================================================
-- Transactions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "txHash" VARCHAR(66) UNIQUE NOT NULL,
  "from" VARCHAR(42) NOT NULL,
  "to" VARCHAR(42),
  value DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  "gasPrice" DECIMAL(40, 0) NOT NULL,
  gas DECIMAL(40, 0) NOT NULL,
  "gasUsed" DECIMAL(40, 0),
  input TEXT DEFAULT '0x',
  "blockNumber" INTEGER,
  "blockHash" VARCHAR(66),
  "transactionIndex" INTEGER,
  status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending' NOT NULL,
  type ENUM('transfer', 'deposit', 'withdrawal', 'stake', 'unstake', 'contract', 'other') DEFAULT 'other' NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_txHash ON transactions("txHash");
CREATE INDEX idx_transactions_from ON transactions("from");
CREATE INDEX idx_transactions_to ON transactions("to");
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_blockNumber ON transactions("blockNumber");
CREATE INDEX idx_transactions_createdAt ON transactions("createdAt");

-- ============================================================================
-- Token Balances Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userAddress" VARCHAR(42) NOT NULL,
  "tokenAddress" VARCHAR(42) NOT NULL,
  balance DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  locked DECIMAL(40, 0) DEFAULT '0' NOT NULL,
  "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userAddress", "tokenAddress")
);

CREATE INDEX idx_token_balances_userAddress ON token_balances("userAddress");
CREATE INDEX idx_token_balances_tokenAddress ON token_balances("tokenAddress");
CREATE INDEX idx_token_balances_lastUpdated ON token_balances("lastUpdated");

-- ============================================================================
-- Staking Records Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS staking_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "validatorAddress" VARCHAR(42) NOT NULL,
  "userAddress" VARCHAR(42) NOT NULL,
  amount DECIMAL(40, 0) NOT NULL,
  type ENUM('stake', 'unstake', 'reward', 'slash', 'redeposit') NOT NULL,
  "txHash" VARCHAR(66) NOT NULL,
  "blockNumber" INTEGER NOT NULL,
  "rewardsEarned" DECIMAL(40, 0) DEFAULT '0',
  "rewardsClaimed" DECIMAL(40, 0) DEFAULT '0',
  "lastRewardBlock" INTEGER,
  status ENUM('pending', 'confirmed', 'claimed', 'slashed') DEFAULT 'pending' NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staking_records_validatorAddress ON staking_records("validatorAddress");
CREATE INDEX idx_staking_records_userAddress ON staking_records("userAddress");
CREATE INDEX idx_staking_records_type ON staking_records(type);
CREATE INDEX idx_staking_records_status ON staking_records(status);
CREATE INDEX idx_staking_records_blockNumber ON staking_records("blockNumber");
CREATE INDEX idx_staking_records_createdAt ON staking_records("createdAt");

-- ============================================================================
-- API Keys Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userAddress" VARCHAR(42) NOT NULL,
  "keyHash" VARCHAR(64) UNIQUE NOT NULL,
  "keyPrefix" VARCHAR(8) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '["read:public"]'::jsonb,
  "rateLimit" INTEGER,
  status ENUM('active', 'revoked', 'expired') DEFAULT 'active' NOT NULL,
  "lastUsed" TIMESTAMP,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_userAddress ON api_keys("userAddress");
CREATE INDEX idx_api_keys_keyHash ON api_keys("keyHash");
CREATE INDEX idx_api_keys_keyPrefix ON api_keys("keyPrefix");
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_expiresAt ON api_keys("expiresAt");

-- ============================================================================
-- Verify schema creation
-- ============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
