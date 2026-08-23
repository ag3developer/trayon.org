/**
 * useAuth.ts - Backend Authentication Hook
 * 
 * Handles communication with backend authentication endpoints
 * Manages JWT tokens, user sessions, and API requests
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWeb3 } from './useWeb3';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signUp: (address: string, email: string, username: string) => Promise<void>;
  signIn: (signature: string, message: string) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<any>;
  updateProfile: (data: any) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Main Auth Hook
 */
export function useAuth(): [AuthState, AuthActions] {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });

  const [web3State] = useWeb3();

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('trayon_token');
    if (token) {
      setState((prev) => ({
        ...prev,
        token,
        isAuthenticated: true,
      }));
    }
  }, []);

  /**
   * Sign up - Create new user account
   */
  const signUp = useCallback(
    async (address: string, email: string, username: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            email,
            username,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Sign up failed');
        }

        const data = await response.json();
        localStorage.setItem('trayon_token', data.token);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          error: null,
        }));
      } catch (error: any) {
        const errorMessage = error?.message || 'Sign up failed';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('Sign Up Error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Sign in - Authenticate with wallet signature
   */
  const signIn = useCallback(
    async (signature: string, message: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!web3State.address) {
          throw new Error('Wallet not connected');
        }

        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: web3State.address,
            signature,
            message,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Sign in failed');
        }

        const data = await response.json();
        localStorage.setItem('trayon_token', data.token);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          error: null,
        }));
      } catch (error: any) {
        const errorMessage = error?.message || 'Sign in failed';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('Sign In Error:', error);
        throw error;
      }
    },
    [web3State.address]
  );

  /**
   * Logout - Clear authentication state
   */
  const logout = useCallback(async () => {
    try {
      const token = state.token;

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem('trayon_token');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout Error:', error);
    }
  }, [state.token]);

  /**
   * Get current user profile
   */
  const getUser = useCallback(async () => {
    try {
      if (!state.token) {
        throw new Error('Not authenticated');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('trayon_token');
          setState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: 'Session expired',
          });
        }
        throw new Error('Failed to get user profile');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        user: data,
        error: null,
      }));

      return data;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get user';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Get User Error:', error);
      throw error;
    }
  }, [state.token]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: any) => {
      try {
        if (!state.token) {
          throw new Error('Not authenticated');
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const updatedUser = await response.json();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          user: updatedUser,
          error: null,
        }));
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to update profile';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('Update Profile Error:', error);
        throw error;
      }
    },
    [state.token]
  );

  const actions: AuthActions = {
    signUp,
    signIn,
    logout,
    getUser,
    updateProfile,
  };

  return [state, actions];
}

/**
 * Hook to make authenticated API requests
 */
export function useAPI() {
  const [authState] = useAuth();

  const request = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
      };

      if (authState.token) {
        headers['Authorization'] = `Bearer ${authState.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return response.json();
    },
    [authState.token]
  );

  return { request, isAuthenticated: authState.isAuthenticated };
}
