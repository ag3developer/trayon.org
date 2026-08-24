'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3, useFormatAddress } from '@/hooks/useWeb3';
import { useAuth } from '@/hooks/useAuth';
import { DashboardConnectState } from './DashboardConnectState';
import { DashboardContent } from './DashboardContent';

interface Portfolio {
  totalValue: string;
  assets: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
}

export function DashboardContainer() {
  const [web3State, web3Actions] = useWeb3();
  const [authState, authActions] = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedAddress = useFormatAddress(web3State.address);

  // Load portfolio when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && web3State.address) {
      loadPortfolio();
    }
  }, [authState.isAuthenticated, web3State.address]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Connect to real endpoint
      // const data = await request(`/api/portfolio/${web3State.address}`);
      // setPortfolio(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
      console.error('Portfolio Load Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await web3Actions.connect();

      if (web3State.signer) {
        const message = `Sign this message to authenticate with Trayon\nTimestamp: ${new Date().toISOString()}`;
        const signature = await web3Actions.signMessage(message);
        await authActions.signIn(signature, message);
      }
    } catch (err: any) {
      console.error('Connect Error:', err);
    }
  };

  if (!web3State.isConnected) {
    return <DashboardConnectState onConnect={handleConnect} />;
  }

  return (
    <DashboardContent
      address={formattedAddress}
      portfolio={portfolio}
      isLoading={isLoading}
      error={error}
      balance={web3State.balance ?? undefined}
      chainId={web3State.chainId ?? undefined}
      onRefresh={loadPortfolio}
    />
  );
}
