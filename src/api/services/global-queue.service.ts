export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  refillInterval: number;
}

export interface TokenBucketStatus {
  tokens: number;
  capacity: number;
  refillRate: string;
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
      tokens: Math.floor(this.tokens),
      capacity: this.config.capacity,
      refillRate: `${this.config.refillRate}/min`,
      lastRefill: this.lastRefill,
    };
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed / this.config.refillInterval) * this.config.refillRate
    );

    if (tokensToAdd > 0) {
      this.tokens = Math.min(
        this.config.capacity,
        this.tokens + tokensToAdd
      );
      this.lastRefill = now;
    }
  }
}

export interface GlobalQueueMessage {
  id: string;
  instanceName: string;
  messageData: any;
  audioMetadata?: {
    url: string;
    duration: number;
    mimeType: string;
  };
  timestamp: number;
  priority: number;
}

export class GlobalQueueService {
  private tokenBucket: GlobalTokenBucket;

  constructor(config: TokenBucketConfig) {
    this.tokenBucket = new GlobalTokenBucket(config);
  }

  async canProcessMessage(): Promise<boolean> {
    return await this.tokenBucket.consume();
  }

  getQueueStatus(): TokenBucketStatus {
    return this.tokenBucket.getStatus();
  }
}