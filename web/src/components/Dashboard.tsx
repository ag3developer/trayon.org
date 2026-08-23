/**
 * Dashboard.tsx - Main Dashboard Component
 * 
 * Integrates wallet connection, authentication, and bridge operations
 * Displays user portfolio and transaction history
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3, useFormatAddress } from '@/hooks/useWeb3';
import { useAuth, useAPI } from '@/hooks/useAuth';
import { Wallet, AlertCircle, TrendingUp } from 'lucide-react';

interface Portfolio {
  totalValue: string;
  assets: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
}

export function Dashboard() {
  const [web3State, web3Actions] = useWeb3();
  const [authState, authActions] = useAuth();
  const { request } = useAPI();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const formattedAddress = useFormatAddress(web3State.address);

  // Load portfolio when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && web3State.address) {
      loadPortfolio();
    }
  }, [authState.isAuthenticated, web3State.address]);

  const loadPortfolio = async () => {
    try {
      setIsLoadingPortfolio(true);
      setPortfolioError(null);

      const data = await request(`/portfolio/${web3State.address}`);
      setPortfolio(data);
    } catch (error: any) {
      setPortfolioError(error.message || 'Failed to load portfolio');
      console.error('Portfolio Load Error:', error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleConnect = async () => {
    try {
      await web3Actions.connect();

      // Sign message for authentication
      if (web3State.signer) {
        const message = `Sign this message to authenticate with Trayon\nTimestamp: ${new Date().toISOString()}`;
        const signature = await web3Actions.signMessage(message);
        
        // Sign in with backend
        await authActions.signIn(signature, message);
      }
    } catch (error: any) {
      console.error('Connect Error:', error);
    }
  };

  // Not connected state
  if (!web3State.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur p-8 text-center">
            <Wallet className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h1 className="mb-2 text-3xl font-bold text-white">Welcome to Trayon</h1>
            <p className="mb-8 text-gray-400">
              Connect your wallet to access your portfolio and bridge assets
            </p>
            <button
              onClick={handleConnect}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected state - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400">
            Account: <code className="font-mono text-blue-400">{formattedAddress}</code>
          </p>
        </div>

        {/* Portfolio Stats */}
        {portfolio && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    ${portfolio.totalValue}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            {portfolio.assets.slice(0, 2).map((asset) => (
              <div
                key={asset.symbol}
                className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur p-6"
              >
                <p className="text-sm text-gray-400">{asset.symbol}</p>
                <p className="mt-2 text-2xl font-bold text-white">{asset.balance}</p>
                <p className="text-xs text-gray-500">${asset.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Assets List */}
        {portfolio && portfolio.assets.length > 0 && (
          <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur overflow-hidden">
            <div className="border-b border-gray-700 px-6 py-4">
              <h2 className="font-semibold text-white">Assets</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-gray-400">
                    <th className="px-6 py-3 text-left">Asset</th>
                    <th className="px-6 py-3 text-right">Balance</th>
                    <th className="px-6 py-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.assets.map((asset) => (
                    <tr
                      key={asset.symbol}
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">{asset.symbol}</td>
                      <td className="px-6 py-4 text-right text-gray-300">{asset.balance}</td>
                      <td className="px-6 py-4 text-right font-medium text-white">
                        ${asset.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error State */}
        {portfolioError && (
          <div className="mb-8 rounded-lg border border-red-500/50 bg-red-500/10 backdrop-blur p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Error Loading Portfolio</p>
              <p className="text-sm text-red-300">{portfolioError}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingPortfolio && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur p-8 text-center">
            <div className="inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
            </div>
            <p className="mt-4 text-gray-400">Loading portfolio...</p>
          </div>
        )}

        {/* Wallet Info */}
        {web3State.balance && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur p-6">
            <h3 className="font-semibold text-white mb-4">Wallet Balance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">ETH Balance</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {Number(web3State.balance).toFixed(4)} ETH
                </p>
              </div>
              <div>
                <p className="text-gray-400">Chain ID</p>
                <p className="text-3xl font-bold text-white mt-2">{web3State.chainId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
