import { GlobalTokenBucket, TokenBucketConfig } from './token-bucket.service';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

class TokenBucketTests {
  private results: TestResult[] = [];

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.results.push({ testName, passed: true });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.results.push({ testName, passed: false, error: error.message });
      console.log(`❌ ${testName}: ${error.message}`);
    }
  }

  async testBasicTokenConsumption(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 10,
      refillRate: 5,
      refillInterval: 1000,
    };

    const bucket = new GlobalTokenBucket(config);

    this.assert(await bucket.consume(1), 'Should consume 1 token');
    this.assert(await bucket.consume(5), 'Should consume 5 tokens');
    this.assert(await bucket.consume(4), 'Should consume remaining 4 tokens');
    this.assert(!(await bucket.consume(1)), 'Should not consume when bucket is empty');
  }

  async testTokenRefill(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 10,
      refillRate: 5,
      refillInterval: 100,
    };

    const bucket = new GlobalTokenBucket(config);

    await bucket.consume(10);
    this.assert(!(await bucket.consume(1)), 'Should be empty after consuming all tokens');

    await this.sleep(150);

    this.assert(await bucket.consume(5), 'Should have refilled 5 tokens after interval');
    this.assert(!(await bucket.consume(1)), 'Should not have more than refilled amount');
  }

  async testTokenCapacity(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 5,
      refillRate: 10,
      refillInterval: 100,
    };

    const bucket = new GlobalTokenBucket(config);

    await bucket.consume(5);
    await this.sleep(150);

    const status = bucket.getStatus();
    this.assert(status.tokens === 5, `Should not exceed capacity, got ${status.tokens}`);
  }

  async testBucketStatus(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 10,
      refillRate: 5,
      refillInterval: 1000,
    };

    const bucket = new GlobalTokenBucket(config);
    await bucket.consume(3);

    const status = bucket.getStatus();

    this.assert(status.tokens === 7, `Should have 7 tokens, got ${status.tokens}`);
    this.assert(status.capacity === 10, 'Capacity should match config');
    this.assert(status.refillRate === 5, 'Refill rate should match config');
    this.assert(status.refillInterval === 1000, 'Refill interval should match config');
  }

  async testBucketReset(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 10,
      refillRate: 5,
      refillInterval: 1000,
    };

    const bucket = new GlobalTokenBucket(config);
    await bucket.consume(8);

    bucket.reset();
    const status = bucket.getStatus();

    this.assert(status.tokens === 10, 'Should reset to full capacity');
  }

  async testRateLimitingScenario(): Promise<void> {
    const config: TokenBucketConfig = {
      capacity: 500,
      refillRate: 500,
      refillInterval: 60000,
    };

    const bucket = new GlobalTokenBucket(config);

    for (let i = 0; i < 500; i++) {
      this.assert(await bucket.consume(1), `Should consume token ${i + 1}`);
    }

    this.assert(!(await bucket.consume(1)), 'Should hit rate limit after 500 tokens');
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Running GlobalTokenBucket Tests...\n');

    await this.runTest('Basic Token Consumption', () => this.testBasicTokenConsumption());
    await this.runTest('Token Refill', () => this.testTokenRefill());
    await this.runTest('Token Capacity', () => this.testTokenCapacity());
    await this.runTest('Bucket Status', () => this.testBucketStatus());
    await this.runTest('Bucket Reset', () => this.testBucketReset());
    await this.runTest('Rate Limiting Scenario', () => this.testRateLimitingScenario());

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;

    console.log('\n📊 Test Summary:');
    console.log(`Passed: ${passed}/${total}`);

    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  - ${r.testName}: ${r.error}`));
    }
  }
}

if (require.main === module) {
  const tests = new TokenBucketTests();
  tests.runAllTests().catch(console.error);
}

export { TokenBucketTests };