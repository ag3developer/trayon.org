/**
 * Wallet.tsx - MetaMask Wallet Connection Component
 * 
 * Displays wallet connection status, address, balance
 * Provides UI for connecting, disconnecting, and switching networks
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3, useFormatAddress } from '@/hooks/useWeb3';
import { ChevronDown, LogOut, Wallet as WalletIcon, AlertCircle } from 'lucide-react';

interface WalletProps {
  className?: string;
}

export function Wallet({ className = '' }: WalletProps) {
  const [state, actions] = useWeb3();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const formattedAddress = useFormatAddress(state.address);

  const handleCopyAddress = () => {
    if (state.address) {
      navigator.clipboard.writeText(state.address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    await actions.connect();
  };

  const handleDisconnect = async () => {
    await actions.disconnect();
    setIsDropdownOpen(false);
  };

  const handleSwitchNetwork = async (chainId: number) => {
    await actions.switchNetwork(chainId);
    setIsDropdownOpen(false);
  };

  // Don't render until client-side
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  // Not connected - show connect button
  if (!state.isConnected) {
    return (
      <div className={className}>
        <button
          onClick={handleConnect}
          disabled={state.isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <WalletIcon className="w-4 h-4" />
          {state.isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {state.error && (
          <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{state.error}</span>
          </div>
        )}
      </div>
    );
  }

  // Connected - show address and dropdown
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200"
      >
        <div className="w-2 h-2 rounded-full bg-white"></div>
        {formattedAddress}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
          {/* Header with full address */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Connected Address</p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-900 break-all">
                {state.address}
              </code>
              <button
                onClick={handleCopyAddress}
                className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Balance */}
          {state.balance && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {Number(state.balance).toFixed(4)} ETH
              </p>
            </div>
          )}

          {/* Network Info */}
          {state.chainId && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Network (Chain ID: {state.chainId})</p>
              <div className="space-y-2">
                <NetworkButton
                  name="Ethereum"
                  chainId={1}
                  isActive={state.chainId === 1}
                  onClick={() => handleSwitchNetwork(1)}
                />
                <NetworkButton
                  name="Sepolia"
                  chainId={11155111}
                  isActive={state.chainId === 11155111}
                  onClick={() => handleSwitchNetwork(11155111)}
                />
                <NetworkButton
                  name="Polygon"
                  chainId={137}
                  isActive={state.chainId === 137}
                  onClick={() => handleSwitchNetwork(137)}
                />
                <NetworkButton
                  name="Mumbai"
                  chainId={80001}
                  isActive={state.chainId === 80001}
                  onClick={() => handleSwitchNetwork(80001)}
                />
                <NetworkButton
                  name="Arbitrum"
                  chainId={42161}
                  isActive={state.chainId === 42161}
                  onClick={() => handleSwitchNetwork(42161)}
                />
              </div>
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}

      {state.error && (
        <div className="mt-2 flex items-center gap-2 p-2 rounded bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-xs text-red-700">{state.error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * NetworkButton - Individual network option in dropdown
 */
interface NetworkButtonProps {
  name: string;
  chainId: number;
  isActive: boolean;
  onClick: () => void;
}

function NetworkButton({ name, chainId, isActive, onClick }: NetworkButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-900'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {name}
      {isActive && <span className="ml-2 text-xs">✓</span>}
    </button>
  );
}

/**
 * WalletStatus - Display-only wallet status component
 */
interface WalletStatusProps {
  className?: string;
}

export function WalletStatus({ className = '' }: WalletStatusProps) {
  const [state] = useWeb3();
  const [isMounted, setIsMounted] = useState(false);
  const formattedAddress = useFormatAddress(state.address);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          state.isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`}
      ></div>
      <span className="text-sm font-medium">
        {state.isConnected ? (
          <>
            Connected to <code className="font-mono">{formattedAddress}</code>
          </>
        ) : (
          'Not connected'
        )}
      </span>
    </div>
  );
}

export default Wallet;
