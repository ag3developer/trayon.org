/**
 * Multi-Signature Signer
 * Collects signatures from validators for bridge transactions
 * Implements M-of-N multi-sig scheme (e.g., 3-of-5)
 */

import { Wallet, ethers } from 'ethers';
import type { SignatureData, Logger, ValidatorConfig } from '../types/index.js';

export class MultiSigSigner {
  private validators: Map<string, ValidatorConfig> = new Map();
  private signatures: Map<string, SignatureData[]> = new Map();
  private relayerWallet: Wallet;

  constructor(
    private requiredSignatures: number,
    validators: ValidatorConfig[],
    relayerPrivateKey: string,
    private logger: Logger
  ) {
    // Initialize validators map
    validators.forEach((v) => {
      this.validators.set(v.address.toLowerCase(), v);
    });

    // Initialize relayer wallet
    this.relayerWallet = new Wallet(relayerPrivateKey);

    this.logger.info('MultiSigSigner initialized', {
      relayerAddress: this.relayerWallet.address,
      validators: validators.length,
      requiredSignatures,
    });
  }

  /**
   * Sign a transaction data with relayer's private key
   */
  async signTransaction(
    transactionHash: string,
    user: string,
    amount: bigint,
    nonce: number
  ): Promise<string> {
    try {
      // Create message to sign: hash(user, amount, nonce)
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256'],
        [user, amount.toString(), nonce]
      );

      // Sign the message
      const signature = await this.relayerWallet.signMessage(
        ethers.getBytes(messageHash)
      );

      this.logger.debug('Transaction signed', {
        transactionHash,
        user,
        amount: amount.toString(),
        signature: signature.substring(0, 20) + '...',
      });

      return signature;
    } catch (error) {
      this.logger.error('Error signing transaction', error);
      throw error;
    }
  }

  /**
   * Add a signature to a transaction
   */
  async addSignature(
    transactionHash: string,
    validatorAddress: string,
    signature: string
  ): Promise<void> {
    const normalizedAddress = validatorAddress.toLowerCase();

    // Verify validator exists
    if (!this.validators.has(normalizedAddress)) {
      throw new Error(`Unknown validator: ${validatorAddress}`);
    }

    // Initialize signatures array for this transaction if needed
    if (!this.signatures.has(transactionHash)) {
      this.signatures.set(transactionHash, []);
    }

    const txSignatures = this.signatures.get(transactionHash)!;

    // Check if this validator has already signed
    const alreadySigned = txSignatures.some(
      (s) => s.validator.toLowerCase() === normalizedAddress
    );

    if (alreadySigned) {
      this.logger.warn('Validator has already signed this transaction', {
        transactionHash,
        validator: validatorAddress,
      });
      return;
    }

    // Add signature
    txSignatures.push({
      validator: validatorAddress,
      signature,
      timestamp: Date.now(),
    });

    this.logger.debug('Signature added', {
      transactionHash,
      validator: validatorAddress,
      totalSignatures: txSignatures.length,
      requiredSignatures: this.requiredSignatures,
    });
  }

  /**
   * Check if we have enough signatures to execute
   */
  canExecute(transactionHash: string): boolean {
    const signatures = this.signatures.get(transactionHash) || [];
    return signatures.length >= this.requiredSignatures;
  }

  /**
   * Get signatures for a transaction
   */
  getSignatures(transactionHash: string): SignatureData[] {
    return this.signatures.get(transactionHash) || [];
  }

  /**
   * Get required number of signatures
   */
  getRequiredSignatures(): number {
    return this.requiredSignatures;
  }

  /**
   * Get remaining signatures needed
   */
  getRemainingSignatures(transactionHash: string): number {
    const signatures = this.signatures.get(transactionHash) || [];
    return Math.max(0, this.requiredSignatures - signatures.length);
  }

  /**
   * Clear signatures for a transaction (after execution)
   */
  clearSignatures(transactionHash: string): void {
    this.signatures.delete(transactionHash);
    this.logger.debug('Signatures cleared', { transactionHash });
  }

  /**
   * Get signature status
   */
  getSignatureStatus(transactionHash: string) {
    const signatures = this.signatures.get(transactionHash) || [];
    return {
      transactionHash,
      signatureCount: signatures.length,
      requiredSignatures: this.requiredSignatures,
      canExecute: signatures.length >= this.requiredSignatures,
      remainingSignatures: Math.max(0, this.requiredSignatures - signatures.length),
      signatories: signatures.map((s) => s.validator),
    };
  }

  /**
   * Recover signer from message and signature
   */
  async recoverSigner(messageHash: string, signature: string): Promise<string> {
    try {
      const address = ethers.recoverAddress(messageHash, signature);
      return address;
    } catch (error) {
      this.logger.error('Error recovering signer', error);
      throw error;
    }
  }

  /**
   * Verify a signature
   */
  async verifySignature(
    messageHash: string,
    signature: string,
    expectedSigner: string
  ): Promise<boolean> {
    try {
      const signer = await this.recoverSigner(messageHash, signature);
      return signer.toLowerCase() === expectedSigner.toLowerCase();
    } catch (error) {
      this.logger.error('Error verifying signature', error);
      return false;
    }
  }

  /**
   * Get relayer address
   */
  getRelayerAddress(): string {
    return this.relayerWallet.address;
  }

  /**
   * Get validators
   */
  getValidators(): ValidatorConfig[] {
    return Array.from(this.validators.values());
  }
}
