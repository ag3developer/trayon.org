/**
 * Transaction Queue
 * Manages transaction batching and parallel processing
 * Uses Bull for job queue with Redis
 */

import Logger from './utils/logger';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
}

interface Batch {
  id: string;
  transactions: Transaction[];
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  blockHash?: string;
}

class TransactionQueue {
  private logger: Logger;
  private queue: Transaction[] = [];
  private batches: Map<string, Batch> = new Map();
  private batchSize: number = 100;
  private batchTimeout: number = 1000; // 1 second
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(batchSize: number = 100, batchTimeout: number = 1000) {
    this.logger = new Logger('TransactionQueue');
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }

  /**
   * Add transaction to queue
   */
  async enqueue(tx: Transaction): Promise<void> {
    this.queue.push(tx);
    this.logger.debug(`Transaction queued: ${tx.hash}`);

    // Trigger processing if batch is full
    if (this.queue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * Start queue processing
   */
  start(): void {
    this.logger.info('Starting transaction queue processing...');

    this.processingInterval = setInterval(async () => {
      if (this.queue.length > 0) {
        await this.processBatch();
      }
    }, this.batchTimeout);
  }

  /**
   * Stop queue processing
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.logger.info('Transaction queue stopped');
  }

  /**
   * Process a batch of transactions
   */
  private async processBatch(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const batchId = this.generateBatchId();
    const txsToProcess = this.queue.splice(0, this.batchSize);

    const batch: Batch = {
      id: batchId,
      transactions: txsToProcess,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.batches.set(batchId, batch);

    this.logger.info(
      `Processing batch ${batchId} with ${txsToProcess.length} transactions`
    );

    try {
      // Process transactions in parallel
      await this.executeTransactions(batch);
      batch.status = 'completed';
      this.logger.info(`✅ Batch ${batchId} completed`);
    } catch (error) {
      batch.status = 'failed';
      this.logger.error(`❌ Batch ${batchId} failed:`, error);
    }
  }

  /**
   * Execute transactions in parallel
   */
  private async executeTransactions(batch: Batch): Promise<void> {
    const parallelism = 10; // Process 10 transactions in parallel
    const promises: Promise<void>[] = [];

    for (let i = 0; i < batch.transactions.length; i += parallelism) {
      const chunk = batch.transactions.slice(
        i,
        Math.min(i + parallelism, batch.transactions.length)
      );

      const chunkPromises = chunk.map((tx) => this.executeTransaction(tx));
      promises.push(...chunkPromises);
    }

    await Promise.all(promises);
  }

  /**
   * Execute a single transaction
   */
  private async executeTransaction(tx: Transaction): Promise<void> {
    try {
      // Simulate transaction execution
      const executionTime = Math.random() * 100; // 0-100ms
      await new Promise((resolve) => setTimeout(resolve, executionTime));

      this.logger.debug(`✅ Transaction executed: ${tx.hash}`);
    } catch (error) {
      this.logger.error(`❌ Transaction failed: ${tx.hash}`, error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): object {
    const completedBatches = Array.from(this.batches.values()).filter(
      (b) => b.status === 'completed'
    ).length;
    const failedBatches = Array.from(this.batches.values()).filter(
      (b) => b.status === 'failed'
    ).length;

    return {
      queueLength: this.queue.length,
      totalBatches: this.batches.size,
      completedBatches,
      failedBatches,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout,
    };
  }

  /**
   * Get batch status
   */
  getBatchStatus(batchId: string): Batch | null {
    return this.batches.get(batchId) || null;
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

export default TransactionQueue;
