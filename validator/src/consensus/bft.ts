/**
 * Byzantine Fault Tolerant (BFT) Consensus Implementation
 * 
 * Implements practical Byzantine Fault Tolerance (PBFT) algorithm:
 * - 3f + 1 nodes tolerance (where f = faulty nodes)
 * - 3 phases: Pre-prepare, Prepare, Commit
 * - 2/3 majority voting for consensus
 * - Supports up to 3, 5, 7, ... validator nodes
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export interface BFTProposal {
  viewNumber: number;
  sequenceNumber: bigint;
  blockHash: string;
  blockData: any;
  timestamp: number;
  proposer: string;
}

export interface BFTVote {
  viewNumber: number;
  sequenceNumber: bigint;
  blockHash: string;
  voter: string;
  signature: string;
  phase: 'prepare' | 'commit';
}

export interface BFTMessage {
  type: 'pre-prepare' | 'prepare' | 'commit';
  proposal?: BFTProposal;
  vote?: BFTVote;
  sender: string;
  timestamp: number;
}

export interface ValidatorNode {
  address: string;
  publicKey: string;
  isActive: boolean;
}

export class BFTConsensus extends EventEmitter {
  private logger: Logger;
  private validatorId: string;
  private validators: ValidatorNode[];
  private viewNumber: number = 0;
  private sequenceNumber: bigint = 0n;
  private f: number; // Maximum number of faulty nodes
  private quorumSize: number; // 2/3 of validators + 1

  // Message tracking
  private preprepareMsgs: Map<string, BFTProposal> = new Map();
  private prepareMsgs: Map<string, Map<string, BFTVote>> = new Map();
  private commitMsgs: Map<string, Map<string, BFTVote>> = new Map();

  // Voting state
  private prepareVotes: Map<string, BFTVote[]> = new Map();
  private commitVotes: Map<string, BFTVote[]> = new Map();

  // View change state
  private viewChangeInProgress: boolean = false;

  constructor(
    validatorId: string,
    validators: ValidatorNode[],
    logger: Logger
  ) {
    super();
    this.logger = logger;
    this.validatorId = validatorId;
    this.validators = validators;

    // BFT tolerance: f = floor((n - 1) / 3)
    this.f = Math.floor((validators.length - 1) / 3);
    // Quorum: 2f + 1
    this.quorumSize = 2 * this.f + 1;

    this.logger.info('BFT Consensus initialized', {
      validatorCount: validators.length,
      faultyTolerance: this.f,
      quorumSize: this.quorumSize,
      validatorId,
    });
  }

  /**
   * Propose a new block (Primary/Leader only)
   */
  proposeBlock(blockData: any): BFTProposal {
    if (!this.isPrimary()) {
      throw new Error('Only primary can propose blocks');
    }

    this.sequenceNumber++;
    const blockHash = this.hashData(blockData);

    const proposal: BFTProposal = {
      viewNumber: this.viewNumber,
      sequenceNumber: this.sequenceNumber,
      blockHash,
      blockData,
      timestamp: Date.now(),
      proposer: this.validatorId,
    };

    this.logger.info('Block proposed', {
      viewNumber: this.viewNumber,
      sequenceNumber: this.sequenceNumber.toString(),
      blockHash,
    });

    return proposal;
  }

  /**
   * Process pre-prepare message
   * Phase 1: Primary broadcasts block to all validators
   */
  handlePreprepare(message: BFTMessage): void {
    if (!message.proposal) {
      this.logger.warn('Invalid pre-prepare message: no proposal');
      return;
    }

    const { proposal } = message;

    // Validate message
    if (proposal.viewNumber !== this.viewNumber) {
      this.logger.warn('Pre-prepare from different view', {
        currentView: this.viewNumber,
        messageView: proposal.viewNumber,
      });
      return;
    }

    const blockKey = `${proposal.viewNumber}-${proposal.sequenceNumber}`;

    // Store pre-prepare
    if (this.preprepareMsgs.has(blockKey)) {
      this.logger.warn('Duplicate pre-prepare message');
      return;
    }

    this.preprepareMsgs.set(blockKey, proposal);

    this.logger.debug('Pre-prepare message received', {
      blockHash: proposal.blockHash,
      sequenceNumber: proposal.sequenceNumber.toString(),
    });

    // Move to prepare phase
    this.sendPrepareVote(proposal);
  }

  /**
   * Send prepare vote for a proposal
   * Phase 2: Validators broadcast prepare votes
   */
  private sendPrepareVote(proposal: BFTProposal): void {
    const vote: BFTVote = {
      viewNumber: proposal.viewNumber,
      sequenceNumber: proposal.sequenceNumber,
      blockHash: proposal.blockHash,
      voter: this.validatorId,
      signature: this.signVote(proposal),
      phase: 'prepare',
    };

    this.logger.debug('Sending prepare vote', {
      blockHash: proposal.blockHash,
    });

    this.emit('prepare-vote', vote);
  }

  /**
   * Handle prepare vote from another validator
   */
  handlePrepare(message: BFTMessage): void {
    if (!message.vote) {
      this.logger.warn('Invalid prepare message: no vote');
      return;
    }

    const { vote } = message;
    const blockKey = `${vote.viewNumber}-${vote.sequenceNumber}`;

    // Initialize vote tracking for this block
    if (!this.prepareMsgs.has(blockKey)) {
      this.prepareMsgs.set(blockKey, new Map());
    }

    const blockVotes = this.prepareMsgs.get(blockKey)!;

    // Check for duplicate vote from same validator
    if (blockVotes.has(vote.voter)) {
      this.logger.warn('Duplicate prepare vote from validator', {
        validator: vote.voter,
      });
      return;
    }

    // Store vote
    blockVotes.set(vote.voter, vote);

    this.logger.debug('Prepare vote received', {
      blockHash: vote.blockHash,
      voteCount: blockVotes.size,
      quorumSize: this.quorumSize,
    });

    // Check if we have quorum for prepare phase
    if (blockVotes.size >= this.quorumSize && !this.commitMsgs.has(blockKey)) {
      this.logger.info('Prepare phase quorum reached', {
        blockHash: vote.blockHash,
        voteCount: blockVotes.size,
      });

      // Move to commit phase
      this.sendCommitVote(vote.viewNumber, vote.sequenceNumber, vote.blockHash);
    }
  }

  /**
   * Send commit vote
   * Phase 3: Validators broadcast commit votes
   */
  private sendCommitVote(
    viewNumber: number,
    sequenceNumber: bigint,
    blockHash: string
  ): void {
    const vote: BFTVote = {
      viewNumber,
      sequenceNumber,
      blockHash,
      voter: this.validatorId,
      signature: this.signData(blockHash),
      phase: 'commit',
    };

    this.logger.debug('Sending commit vote', { blockHash });

    this.emit('commit-vote', vote);
  }

  /**
   * Handle commit vote from another validator
   */
  handleCommit(message: BFTMessage): void {
    if (!message.vote) {
      this.logger.warn('Invalid commit message: no vote');
      return;
    }

    const { vote } = message;
    const blockKey = `${vote.viewNumber}-${vote.sequenceNumber}`;

    // Initialize vote tracking for this block
    if (!this.commitMsgs.has(blockKey)) {
      this.commitMsgs.set(blockKey, new Map());
    }

    const blockVotes = this.commitMsgs.get(blockKey)!;

    // Check for duplicate vote
    if (blockVotes.has(vote.voter)) {
      this.logger.warn('Duplicate commit vote from validator', {
        validator: vote.voter,
      });
      return;
    }

    // Store vote
    blockVotes.set(vote.voter, vote);

    this.logger.debug('Commit vote received', {
      blockHash: vote.blockHash,
      voteCount: blockVotes.size,
      quorumSize: this.quorumSize,
    });

    // Check if we have quorum for commit phase (2f + 1)
    if (blockVotes.size >= this.quorumSize) {
      this.logger.info('Commit phase quorum reached - BLOCK FINALIZED', {
        blockHash: vote.blockHash,
        voteCount: blockVotes.size,
        sequenceNumber: vote.sequenceNumber.toString(),
      });

      // Block is finalized
      this.emit('block-finalized', {
        blockHash: vote.blockHash,
        sequenceNumber: vote.sequenceNumber,
        viewNumber: vote.viewNumber,
        timestamp: Date.now(),
      });

      // Clean up old messages
      this.cleanup(blockKey);
    }
  }

  /**
   * Initiate view change if primary is faulty
   */
  initiateViewChange(): void {
    if (this.viewChangeInProgress) {
      this.logger.warn('View change already in progress');
      return;
    }

    this.viewChangeInProgress = true;
    const oldView = this.viewNumber;
    this.viewNumber++;

    this.logger.warn('Initiating view change', {
      oldView,
      newView: this.viewNumber,
      newPrimary: this.getPrimaryId(),
    });

    this.emit('view-change', {
      oldView,
      newView: this.viewNumber,
      newPrimary: this.getPrimaryId(),
    });

    // Set timeout for view change recovery
    setTimeout(() => {
      this.viewChangeInProgress = false;
      this.logger.info('View change completed', {
        currentView: this.viewNumber,
      });
    }, 5000);
  }

  /**
   * Check if this validator is the primary for current view
   */
  isPrimary(): boolean {
    const primaryIdx = this.viewNumber % this.validators.length;
    return this.validators[primaryIdx].address === this.validatorId;
  }

  /**
   * Get the primary validator ID for current view
   */
  private getPrimaryId(): string {
    const primaryIdx = this.viewNumber % this.validators.length;
    return this.validators[primaryIdx].address;
  }

  /**
   * Get consensus state
   */
  getState() {
    return {
      viewNumber: this.viewNumber,
      sequenceNumber: this.sequenceNumber.toString(),
      primaryId: this.getPrimaryId(),
      isPrimary: this.isPrimary(),
      faultyTolerance: this.f,
      quorumSize: this.quorumSize,
      validatorCount: this.validators.length,
      activeValidators: this.validators.filter(v => v.isActive).length,
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      preprepareMsgs: this.preprepareMsgs.size,
      prepareMsgs: this.prepareMsgs.size,
      commitMsgs: this.commitMsgs.size,
      viewChangeInProgress: this.viewChangeInProgress,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────────────────

  private hashData(data: any): string {
    // Simplified hash (use keccak256 in production)
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  private signData(data: string): string {
    // Simplified signature (use ECDSA in production)
    return `0x${Buffer.from(data).toString('hex')}`;
  }

  private signVote(proposal: BFTProposal): string {
    const voteData = `${proposal.viewNumber}-${proposal.sequenceNumber}-${proposal.blockHash}`;
    return this.signData(voteData);
  }

  private cleanup(blockKey: string): void {
    // Remove old message tracking to save memory
    setTimeout(() => {
      this.preprepareMsgs.delete(blockKey);
      this.prepareMsgs.delete(blockKey);
      this.commitMsgs.delete(blockKey);
    }, 60000); // Cleanup after 1 minute
  }
}
