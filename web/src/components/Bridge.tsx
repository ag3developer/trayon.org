/**
 * Bridge.tsx - L1↔L2 Bridge Component
 * 
 * Demonstrates wallet integration for bridge operations
 * Handles deposits and withdrawals between L1 and L2
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAuth, useAPI } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle, ArrowRightLeft, Loader } from 'lucide-react';

interface BridgeProps {
  className?: string;
}

type BridgeMode = 'deposit' | 'withdraw';

export function Bridge({ className = '' }: BridgeProps) {
  const [web3State, web3Actions] = useWeb3();
  const [authState, authActions] = useAuth();
  const { request } = useAPI();

  const [mode, setMode] = useState<BridgeMode>('deposit');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);

      if (!web3State.address) {
        throw new Error('Wallet not connected');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Send transaction
      const txHash = await web3Actions.sendTransaction(
        process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || '',
        amount
      );

      setTransactionHash(txHash);

      // Record deposit on backend
      await request('/bridge/deposit', {
        method: 'POST',
        body: JSON.stringify({
          userAddress: web3State.address,
          amount,
          token: 'ETH',
          l1TxHash: txHash,
          l1BlockNumber: 0, // Will be fetched from blockchain
        }),
      });

      setSuccess(true);
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
      console.error('Deposit Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [web3State.address, web3Actions, amount, request]);

  // Handle withdrawal
  const handleWithdraw = useCallback(async () => {
    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);

      if (!web3State.address) {
        throw new Error('Wallet not connected');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Call backend to initiate withdrawal
      const result = await request('/bridge/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          userAddress: web3State.address,
          amount,
          token: 'ETH',
        }),
      });

      setTransactionHash(result.l2TxHash);
      setSuccess(true);
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
      console.error('Withdrawal Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [web3State.address, amount, request]);

  const handleTransaction = mode === 'deposit' ? handleDeposit : handleWithdraw;

  if (!web3State.isConnected) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-8 text-center ${className}`}>
        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
        <p className="text-gray-600">
          Please connect your wallet to use the bridge
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-lg ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">L1 ↔ L2 Bridge</h2>
        <p className="mt-2 text-gray-600">Transfer assets between Ethereum and Trayon Layer 2</p>
      </div>

      <div className="p-6">
        {/* Mode Selector */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMode('deposit')}
            className={`rounded px-4 py-2 font-medium transition-colors ${
              mode === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Deposit (L1 → L2)
          </button>
          <button
            onClick={() => setMode('withdraw')}
            className={`rounded px-4 py-2 font-medium transition-colors ${
              mode === 'withdraw'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Withdraw (L2 → L1)
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Amount (ETH)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.001"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-500"
            />
            <button
              onClick={() => {
                if (web3State.balance) {
                  setAmount(web3State.balance);
                }
              }}
              className="rounded px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Max
            </button>
          </div>
          {web3State.balance && (
            <p className="mt-2 text-xs text-gray-500">
              Balance: {Number(web3State.balance).toFixed(4)} ETH
            </p>
          )}
        </div>

        {/* Warnings/Info */}
        <div className="mb-6 space-y-2">
          {mode === 'deposit' && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <p>✓ Funds will be locked on L1 and minted on L2</p>
              <p>✓ Confirmation time: ~30 seconds</p>
            </div>
          )}
          {mode === 'withdraw' && (
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
              <p>⚠ Withdrawal requires proof submission (7 day challenge window)</p>
              <p>⚠ Estimated time: 7-8 days</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && transactionHash && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Success!</p>
              <p className="text-sm text-green-700 break-all">
                Transaction: {transactionHash}
              </p>
            </div>
          </div>
        )}

        {/* Transaction Button */}
        <button
          onClick={handleTransaction}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4" />
              {mode === 'deposit' ? 'Deposit to L2' : 'Withdraw to L1'}
            </>
          )}
        </button>

        {/* Connected Account Info */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Connected Account</p>
          <code className="text-sm font-mono text-gray-900 break-all">
            {web3State.address}
          </code>
        </div>
      </div>
    </div>
  );
}

export default Bridge;
