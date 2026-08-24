/**
 * useWeb3.ts - Backward-compatible re-export
 *
 * The actual implementation now lives in Web3Provider.tsx as a shared
 * React Context (see that file for why). This module is kept so existing
 * `import { useWeb3 } from '@/hooks/useWeb3'` call sites keep working
 * unchanged.
 */
'use client';

export {
  useWeb3,
  useFormatAddress,
  useIsValidAddress,
  Web3Provider,
} from './Web3Provider';
export type { Web3State, Web3Actions, Web3ErrorCode } from './Web3Provider';
