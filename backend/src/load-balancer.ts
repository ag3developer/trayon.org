/**
 * Load Balancer
 * Distributes requests across multiple validator nodes
 * Supports health checks and failover
 */

import Logger from './utils/logger';

interface ValidatorNode {
  id: string;
  url: string;
  port: number;
  weight: number;
  healthy: boolean;
  responseTime: number;
  requestsProcessed: number;
}

interface LoadBalancingConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'response-time';
  healthCheckInterval: number;
  healthCheckTimeout: number;
}

class LoadBalancer {
  private logger: Logger;
  private validators: Map<string, ValidatorNode> = new Map();
  private config: LoadBalancingConfig;
  private currentIndex: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoadBalancingConfig> = {}) {
    this.logger = new Logger('LoadBalancer');
    this.config = {
      strategy: config.strategy || 'least-connections',
      healthCheckInterval: config.healthCheckInterval || 5000,
      healthCheckTimeout: config.healthCheckTimeout || 2000,
    };
  }

  /**
   * Register a validator node
   */
  registerValidator(
    id: string,
    url: string,
    port: number,
    weight: number = 1
  ): void {
    this.validators.set(id, {
      id,
      url,
      port,
      weight,
      healthy: true,
      responseTime: 0,
      requestsProcessed: 0,
    });

    this.logger.info(`Registered validator: ${id} at ${url}:${port}`);
  }

  /**
   * Get next available validator based on strategy
   */
  getNextValidator(): ValidatorNode | null {
    const healthyValidators = Array.from(this.validators.values()).filter(
      (v) => v.healthy
    );

    if (healthyValidators.length === 0) {
      this.logger.warn('No healthy validators available');
      return null;
    }

    switch (this.config.strategy) {
      case 'round-robin':
        return this.roundRobin(healthyValidators);
      case 'least-connections':
        return this.leastConnections(healthyValidators);
      case 'weighted':
        return this.weighted(healthyValidators);
      case 'response-time':
        return this.responseTime(healthyValidators);
      default:
        return healthyValidators[0];
    }
  }

  /**
   * Round-robin strategy
   */
  private roundRobin(validators: ValidatorNode[]): ValidatorNode {
    const validator = validators[this.currentIndex % validators.length];
    this.currentIndex++;
    return validator;
  }

  /**
   * Least connections strategy
   */
  private leastConnections(validators: ValidatorNode[]): ValidatorNode {
    return validators.reduce((prev, current) =>
      current.requestsProcessed < prev.requestsProcessed ? current : prev
    );
  }

  /**
   * Weighted strategy
   */
  private weighted(validators: ValidatorNode[]): ValidatorNode {
    const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const validator of validators) {
      random -= validator.weight;
      if (random <= 0) {
        return validator;
      }
    }

    return validators[0];
  }

  /**
   * Response time strategy
   */
  private responseTime(validators: ValidatorNode[]): ValidatorNode {
    return validators.reduce((prev, current) =>
      current.responseTime < prev.responseTime ? current : prev
    );
  }

  /**
   * Start health checks
   */
  startHealthChecks(): void {
    this.logger.info('Starting health checks...');

    this.healthCheckInterval = setInterval(async () => {
      for (const [_, validator] of this.validators) {
        await this.checkHealth(validator);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.logger.info('Health checks stopped');
  }

  /**
   * Check validator health
   */
  private async checkHealth(validator: ValidatorNode): Promise<void> {
    try {
      const start = Date.now();
      const response = await fetch(`http://${validator.url}:${validator.port}/health`, {
        timeout: this.config.healthCheckTimeout,
      });

      const responseTime = Date.now() - start;

      if (response.ok) {
        validator.healthy = true;
        validator.responseTime = responseTime;
        this.logger.debug(`✅ ${validator.id}: ${responseTime}ms`);
      } else {
        validator.healthy = false;
        this.logger.warn(`❌ ${validator.id}: HTTP ${response.status}`);
      }
    } catch (error) {
      validator.healthy = false;
      this.logger.error(`❌ ${validator.id}: ${error}`);
    }
  }

  /**
   * Record request completion
   */
  recordRequest(validatorId: string, duration: number): void {
    const validator = this.validators.get(validatorId);
    if (validator) {
      validator.requestsProcessed++;
      validator.responseTime = duration;
    }
  }

  /**
   * Get statistics
   */
  getStats(): object {
    const stats: any = {
      totalValidators: this.validators.size,
      healthyValidators: Array.from(this.validators.values()).filter(
        (v) => v.healthy
      ).length,
      strategy: this.config.strategy,
      validators: {},
    };

    for (const [id, validator] of this.validators) {
      stats.validators[id] = {
        healthy: validator.healthy,
        responseTime: validator.responseTime,
        requestsProcessed: validator.requestsProcessed,
        weight: validator.weight,
      };
    }

    return stats;
  }
}

export default LoadBalancer;
