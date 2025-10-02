export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  refillInterval: number;
}

export interface TokenBucketStatus {
  tokens: number;
  capacity: number;
  refillRate: number;
  refillInterval: number;
  lastRefill: number;
}

export class GlobalTokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private config: TokenBucketConfig) {
    this.tokens = config.capacity;
    this.lastRefill = Date.now();
  }

  async consume(amount: number = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }

    return false;
  }

  getStatus(): TokenBucketStatus {
    this.refill();
    return {
      tokens: this.tokens,
      capacity: this.config.capacity,
      refillRate: this.config.refillRate,
      refillInterval: this.config.refillInterval,
      lastRefill: this.lastRefill,
    };
  }

  reset(): void {
    this.tokens = this.config.capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;

    if (timePassed < this.config.refillInterval) {
      return;
    }

    const intervals = Math.floor(timePassed / this.config.refillInterval);
    const tokensToAdd = intervals * this.config.refillRate;

    this.tokens = Math.min(this.config.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}