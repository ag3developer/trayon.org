/**
 * useWeb3.ts - Web3 Connection Hook for MetaMask Integration
 * 
 * Manages wallet connection, account switching, network changes
 * and provides ethers.js provider/signer for contract interactions
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
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

/**
 * Main Web3 Hook
 * Provides wallet connection, account management, and contract interaction
 */
export function useWeb3(): [Web3State, Web3Actions] {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    balance: null,
    isLoading: false,
    error: null,
  });

  // Check if MetaMask is installed
  const hasMetaMask = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (window as any).ethereum !== undefined;
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (!hasMetaMask()) {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }

      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = accounts[0];
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
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect wallet';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: false,
      }));
      console.error('Web3 Connect Error:', error);
    }
  }, [hasMetaMask]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      setState({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        balance: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Web3 Disconnect Error:', error);
    }
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
          // Try to switch to the network
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
          });
        } catch (switchError: any) {
          // Network doesn't exist in MetaMask, try to add it
          if (switchError.code === 4902) {
            const network = SUPPORTED_NETWORKS.find((n) => n.chainId === chainId);
            if (network) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: hexChainId,
                    chainName: network.name,
                    rpcUrls: [network.rpcUrl],
                  },
                ],
              });
            }
          } else {
            throw switchError;
          }
        }

        // Update state after switch
        const provider = new ethers.BrowserProvider(ethereum);
        const network = await provider.getNetwork();
        
        setState((prev) => ({
          ...prev,
          chainId: Number(network.chainId),
          error: null,
        }));
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to switch network';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
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

      setState((prev) => ({
        ...prev,
        balance: formattedBalance,
      }));

      return formattedBalance;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get balance';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
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

        const signature = await state.signer.signMessage(message);
        return signature;
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to sign message';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
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

        const tx = await state.signer.sendTransaction({
          to,
          value: ethers.parseEther(value),
        });

        const receipt = await tx.wait();
        if (!receipt || !receipt.hash) {
          throw new Error('Transaction failed');
        }

        return receipt.hash;
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to send transaction';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        console.error('Send Transaction Error:', error);
        throw error;
      }
    },
    [state.signer]
  );

  // Setup event listeners for account/network changes
  useEffect(() => {
    if (!hasMetaMask()) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.address !== accounts[0]) {
        // Account changed, reconnect
        connect();
      }
    };

    const handleChainChanged = () => {
      // Network changed, reconnect
      connect();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address, hasMetaMask, connect, disconnect]);

  const actions: Web3Actions = {
    connect,
    disconnect,
    switchNetwork,
    getBalance,
    signMessage,
    sendTransaction,
  };

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
