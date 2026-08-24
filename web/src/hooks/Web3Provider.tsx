/**
 * Web3Provider.tsx - Shared Web3 connection context
 *
 * `useWeb3` used to be a plain hook, so every component that called it
 * (Navbar's <Wallet />, the dashboard, etc.) got its own isolated
 * MetaMask connection state. That's why the dashboard kept asking to
 * "Connect Wallet" again even though the navbar already showed a
 * connected address. Wrapping the whole app in a single provider fixes
 * that: all consumers now read/write the same connection state.
 *
 * Also restores the session silently on page load via `eth_accounts`
 * (which — unlike `eth_requestAccounts` — never triggers a MetaMask
 * popup), so refreshing the page or navigating to /dashboard doesn't
 * force the user to reconnect.
 */

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

export type Web3ErrorCode =
  | 'noMetaMask'
  | 'noAccounts'
  | 'connectFailed'
  | 'switchFailed'
  | 'notConnectedError'
  | 'balanceFailed'
  | 'noSigner'
  | 'signFailed'
  | 'sendFailed'
  | 'txFailed';

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  errorCode: Web3ErrorCode | null;
}

export interface Web3Actions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  getBalance: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (to: string, value: string) => Promise<string>;
}

const METAMASK_CHAINID = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  POLYGON: 137,
  MUMBAI: 80001,
  ARBITRUM: 42161,
};

const SUPPORTED_NETWORKS = [
  { chainId: METAMASK_CHAINID.MAINNET, name: 'Ethereum Mainnet', rpcUrl: '' },
  { chainId: METAMASK_CHAINID.SEPOLIA, name: 'Sepolia Testnet', rpcUrl: '' },
  { chainId: METAMASK_CHAINID.POLYGON, name: 'Polygon', rpcUrl: '' },
  { chainId: METAMASK_CHAINID.MUMBAI, name: 'Mumbai Testnet', rpcUrl: '' },
  { chainId: METAMASK_CHAINID.ARBITRUM, name: 'Arbitrum One', rpcUrl: '' },
];

const initialState: Web3State = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: null,
  isLoading: false,
  error: null,
  errorCode: null,
};

const Web3StateContext = createContext<Web3State>(initialState);
const Web3ActionsContext = createContext<Web3Actions | null>(null);

export function Web3Provider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<Web3State>(initialState);

  const hasMetaMask = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (window as any).ethereum !== undefined;
  }, []);

  const hydrateFromProvider = useCallback(async (address: string) => {
    const ethereum = (window as any).ethereum;
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    setState({
      isConnected: true,
      address,
      provider,
      signer,
      chainId: Number(network.chainId),
      balance: ethers.formatEther(balance),
      isLoading: false,
      error: null,
      errorCode: null,
    });
  }, []);

  // Connect wallet (explicit user action — may prompt MetaMask)
  const connect = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null, errorCode: null }));

      if (!hasMetaMask()) {
        const err: any = new Error('MetaMask is not installed. Please install it to continue.');
        err.code = 'noMetaMask';
        throw err;
      }

      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        const err: any = new Error('No accounts found. Please unlock MetaMask.');
        err.code = 'noAccounts';
        throw err;
      }

      await hydrateFromProvider(accounts[0]);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect wallet';
      const errorCode: Web3ErrorCode =
        error?.code === 'noMetaMask' || error?.code === 'noAccounts' ? error.code : 'connectFailed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        errorCode,
        isConnected: false,
      }));
      console.error('Web3 Connect Error:', error);
    }
  }, [hasMetaMask, hydrateFromProvider]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    setState(initialState);
  }, []);

  // Switch network
  const switchNetwork = useCallback(
    async (chainId: number) => {
      try {
        if (!hasMetaMask()) {
          throw new Error('MetaMask is not installed.');
        }

        const ethereum = (window as any).ethereum;
        const hexChainId = `0x${chainId.toString(16)}`;

        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            const network = SUPPORTED_NETWORKS.find((n) => n.chainId === chainId);
            if (network) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{ chainId: hexChainId, chainName: network.name, rpcUrls: [network.rpcUrl] }],
              });
            }
          } else {
            throw switchError;
          }
        }

        const provider = new ethers.BrowserProvider(ethereum);
        const network = await provider.getNetwork();

        setState((prev) => ({
          ...prev,
          chainId: Number(network.chainId),
          error: null,
          errorCode: null,
        }));
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to switch network';
        setState((prev) => ({ ...prev, error: errorMessage, errorCode: 'switchFailed' }));
        console.error('Switch Network Error:', error);
      }
    },
    [hasMetaMask]
  );

  // Get balance
  const getBalance = useCallback(async (): Promise<string> => {
    try {
      if (!state.provider || !state.address) {
        throw new Error('Wallet not connected');
      }
      const balance = await state.provider.getBalance(state.address);
      const formattedBalance = ethers.formatEther(balance);
      setState((prev) => ({ ...prev, balance: formattedBalance }));
      return formattedBalance;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get balance';
      setState((prev) => ({ ...prev, error: errorMessage, errorCode: 'balanceFailed' }));
      console.error('Get Balance Error:', error);
      throw error;
    }
  }, [state.provider, state.address]);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      try {
        if (!state.signer) {
          throw new Error('Signer not available');
        }
        return await state.signer.signMessage(message);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to sign message';
        setState((prev) => ({ ...prev, error: errorMessage, errorCode: 'signFailed' }));
        console.error('Sign Message Error:', error);
        throw error;
      }
    },
    [state.signer]
  );

  // Send transaction
  const sendTransaction = useCallback(
    async (to: string, value: string): Promise<string> => {
      try {
        if (!state.signer) {
          throw new Error('Signer not available');
        }
        const tx = await state.signer.sendTransaction({ to, value: ethers.parseEther(value) });
        const receipt = await tx.wait();
        if (!receipt?.hash) {
          const err: any = new Error('Transaction failed');
          err.code = 'txFailed';
          throw err;
        }
        return receipt.hash;
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to send transaction';
        setState((prev) => ({ ...prev, error: errorMessage, errorCode: 'sendFailed' }));
        console.error('Send Transaction Error:', error);
        throw error;
      }
    },
    [state.signer]
  );

  // Silently restore an already-authorized session on mount, without
  // prompting MetaMask (eth_accounts never opens a popup, unlike
  // eth_requestAccounts).
  useEffect(() => {
    if (!hasMetaMask()) return;
    let cancelled = false;

    (async () => {
      try {
        const ethereum = (window as any).ethereum;
        const accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
        if (!cancelled && accounts && accounts.length > 0) {
          await hydrateFromProvider(accounts[0]);
        }
      } catch (error) {
        console.error('Web3 Silent Restore Error:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup event listeners for account/network changes
  useEffect(() => {
    if (!hasMetaMask()) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        hydrateFromProvider(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      const accounts = state.address ? [state.address] : null;
      if (accounts) {
        hydrateFromProvider(accounts[0]);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address, hasMetaMask, hydrateFromProvider, disconnect]);

  const actions: Web3Actions = useMemo(
    () => ({
      connect,
      disconnect,
      switchNetwork,
      getBalance,
      signMessage,
      sendTransaction,
    }),
    [connect, disconnect, switchNetwork, getBalance, signMessage, sendTransaction]
  );

  return (
    <Web3StateContext.Provider value={state}>
      <Web3ActionsContext.Provider value={actions}>{children}</Web3ActionsContext.Provider>
    </Web3StateContext.Provider>
  );
}

/**
 * Drop-in replacement for the old standalone `useWeb3` hook — same
 * `[state, actions]` tuple shape, but now backed by shared context so
 * every component sees the same connection.
 */
export function useWeb3(): [Web3State, Web3Actions] {
  const state = useContext(Web3StateContext);
  const actions = useContext(Web3ActionsContext);
  if (!actions) {
    throw new Error('useWeb3 must be used within a <Web3Provider>');
  }
  return [state, actions];
}

/**
 * Hook to format address (0x1234...5678)
 */
export function useFormatAddress(address: string | null): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Hook to check if address is valid
 */
export function useIsValidAddress(address: string | null): boolean {
  if (!address) return false;
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}
