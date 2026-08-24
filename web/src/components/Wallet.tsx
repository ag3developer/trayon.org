/**
 * Wallet.tsx - MetaMask Wallet Connection Component
 *
 * Displays wallet connection status, address, balance
 * Provides UI for connecting, disconnecting, and switching networks
 *
 * Follows the same conventions used across the site:
 * - i18n via next-intl (`useTranslations("wallet")`)
 * - design tokens (border-border, text-muted, bg-surface, text-foreground, text-accent, bg-danger/10, etc.)
 * - responsive by default (no forced "hidden" on small screens)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useWeb3, useFormatAddress } from '@/hooks/useWeb3';
import { ChevronDown, LogOut, Wallet as WalletIcon, AlertCircle, BarChart3 } from 'lucide-react';

interface WalletProps {
  className?: string;
}

const NETWORKS = [
  { name: 'Ethereum', chainId: 1 },
  { name: 'Sepolia', chainId: 11155111 },
  { name: 'Polygon', chainId: 137 },
  { name: 'Mumbai', chainId: 80001 },
  { name: 'Arbitrum', chainId: 42161 },
] as const;

// Native currency symbol for each supported chain — Polygon's native
// token is MATIC/POL, not ETH, so the balance label must follow the
// connected network instead of always showing "ETH".
const NATIVE_CURRENCY: { [chainId: number]: string } = {
  1: 'ETH',
  11155111: 'ETH',
  137: 'POL',
  80001: 'MATIC',
  42161: 'ETH',
};

export function Wallet({ className = '' }: Readonly<WalletProps>) {
  const t = useTranslations('wallet');
  const router = useRouter();
  const [state, actions] = useWeb3();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const formattedAddress = useFormatAddress(state.address);

  const errorMessage = state.errorCode ? t(`errors.${state.errorCode}`) : state.error;

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

  const handleViewPortfolio = () => {
    router.push('/dashboard');
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
        type="button"
        disabled
        className={`inline-flex flex-shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted opacity-60 ${className}`}
      >
        {t('loading')}
      </button>
    );
  }

  // Not connected - show connect button
  if (!state.isConnected) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleConnect}
          disabled={state.isLoading}
          className="inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <WalletIcon className="h-4 w-4" strokeWidth={1.75} />
          <span>{state.isLoading ? t('connecting') : t('connect')}</span>
        </button>
        {errorMessage && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
            <span className="text-sm text-danger">{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Connected - show address and dropdown
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/40"
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
        {formattedAddress}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-surface shadow-xl">
          {/* Header with full address */}
          <div className="border-b border-border p-4">
            <p className="mb-1 text-xs text-muted">{t('connectedAddress')}</p>
            <div className="flex items-center justify-between gap-2">
              <code className="break-all text-sm text-foreground">{state.address}</code>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex-shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {isCopied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>

          {/* Balance */}
          {state.balance && (
            <div className="border-b border-border p-4">
              <p className="mb-1 text-xs text-muted">{t('balance')}</p>
              <p className="text-lg font-semibold text-foreground">
                {Number(state.balance).toFixed(4)} {NATIVE_CURRENCY[state.chainId ?? 1] ?? 'ETH'}
              </p>
            </div>
          )}

          {/* Network Info */}
          {state.chainId && (
            <div className="border-b border-border p-4">
              <p className="mb-2 text-xs text-muted">
                {t('network')} (Chain ID: {state.chainId})
              </p>
              <div className="space-y-2">
                {NETWORKS.map((network) => (
                  <NetworkButton
                    key={network.chainId}
                    name={network.name}
                    isActive={state.chainId === network.chainId}
                    onClick={() => handleSwitchNetwork(network.chainId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* View Portfolio Button */}
          <button
            type="button"
            onClick={handleViewPortfolio}
            className="flex w-full items-center justify-center gap-2 border-b border-border p-4 text-sm font-medium text-accent transition-colors hover:bg-accent/5"
          >
            <BarChart3 className="h-4 w-4" />
            View Portfolio
          </button>

          {/* Disconnect Button */}
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            {t('disconnect')}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="absolute right-0 z-50 mt-2 flex w-64 items-center gap-2 rounded-md border border-danger/30 bg-danger/10 p-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
          <span className="text-xs text-danger">{errorMessage}</span>
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
  isActive: boolean;
  onClick: () => void;
}

function NetworkButton({ name, isActive, onClick }: Readonly<NetworkButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
        isActive ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted hover:text-foreground'
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

export function WalletStatus({ className = '' }: Readonly<WalletStatusProps>) {
  const t = useTranslations('wallet');
  const [state] = useWeb3();
  const [isMounted, setIsMounted] = useState(false);
  const formattedAddress = useFormatAddress(state.address);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`h-2 w-2 flex-shrink-0 rounded-full ${
          state.isConnected ? 'bg-accent' : 'bg-muted'
        }`}
      />
      <span className="text-sm font-medium text-foreground">
        {state.isConnected ? (
          <>
            {t('connectedTo')} <code className="font-mono">{formattedAddress}</code>
          </>
        ) : (
          t('notConnected')
        )}
      </span>
    </div>
  );
}

export default Wallet;
