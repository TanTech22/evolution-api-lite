#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

class LoadTestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.apiKey = 'teste123';
    this.instances = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimeSum: 0,
      errors: {},
      startTime: null,
      endTime: null
    };
    this.maxInstances = 500;
    this.messagesPerSecond = 10;
    this.testDurationMs = 60000; // 1 minuto
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async createTestInstance(instanceName) {
    try {
      const response = await axios.post(`${this.baseUrl}/instance/create`, {
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        token: this.apiKey
      }, {
        headers: { apikey: this.apiKey },
        timeout: 30000
      });

      return response.status === 201;
    } catch (error) {
      this.log(`Failed to create instance ${instanceName}: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async configureAudioFilter(instanceName, config = { minDurationSeconds: 3, maxDurationSeconds: 300, enabled: true }) {
    try {
      const response = await axios.put(`${this.baseUrl}/instance/${instanceName}/filters/audio`, config, {
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey
        },
        timeout: 10000
      });

      return response.status === 200;
    } catch (error) {
      this.log(`Failed to configure audio filter for ${instanceName}: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async simulateWebhookLoad(instanceName, messageType = 'text') {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      let messageData;

      if (messageType === 'audio') {
        messageData = {
          key: {
            remoteJid: `55119${crypto.randomInt(10000000, 99999999)}@s.whatsapp.net`,
            id: `audio_${crypto.randomUUID()}`
          },
          message: {
            audioMessage: {
              mimetype: 'audio/ogg; codecs=opus',
              seconds: crypto.randomInt(5, 120),
              url: `https://minio.example.com/evolution/audio_${Date.now()}.ogg`
            }
          },
          messageTimestamp: Math.floor(Date.now() / 1000)
        };
      } else {
        messageData = {
          key: {
            remoteJid: `55119${crypto.randomInt(10000000, 99999999)}@s.whatsapp.net`,
            id: `text_${crypto.randomUUID()}`
          },
          message: {
            conversation: `Test message ${crypto.randomInt(1000, 9999)}`
          },
          messageTimestamp: Math.floor(Date.now() / 1000)
        };
      }

      const payload = {
        event: 'messages.upsert',
        instance: instanceName,
        data: messageData,
        server_url: this.baseUrl,
        apikey: this.apiKey
      };

      const response = await axios.post(`${this.baseUrl}/webhook/test`, payload, {
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey
        },
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;
      this.metrics.successfulRequests++;
      this.metrics.responseTimeSum += responseTime;

      return { success: true, responseTime, statusCode: response.status };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.metrics.failedRequests++;
      this.metrics.responseTimeSum += responseTime;

      const errorKey = error.response?.status || error.code || 'unknown';
      this.metrics.errors[errorKey] = (this.metrics.errors[errorKey] || 0) + 1;

      return {
        success: false,
        responseTime,
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }

  async checkSystemHealth() {
    try {
      const [instancesResponse, queueStatsResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/instance/fetchInstances`, {
          headers: { apikey: this.apiKey },
          timeout: 10000
        }),
        axios.get(`${this.baseUrl}/queue/stats`, {
          headers: { apikey: this.apiKey },
          timeout: 10000
        }).catch(() => ({ data: { error: 'queue stats not available' } }))
      ]);

      return {
        instanceCount: instancesResponse.data.length,
        activeInstances: instancesResponse.data.filter(i => i.connectionStatus === 'open').length,
        queueStats: queueStatsResponse.data
      };
    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async runLoadTest() {
    this.log('🚀 Starting Load Test for Evolution API Lite');
    this.log(`Target: ${this.maxInstances} instances, ${this.messagesPerSecond} msg/s, ${this.testDurationMs/1000}s duration`);

    // Health check inicial
    const initialHealth = await this.checkSystemHealth();
    if (!initialHealth) {
      this.log('Initial health check failed - aborting test', 'ERROR');
      return;
    }

    this.log(`Initial state: ${initialHealth.instanceCount} instances (${initialHealth.activeInstances} active)`);

    this.metrics.startTime = Date.now();

    // Simular carga de mensagens
    const testPromises = [];
    const messageInterval = 1000 / this.messagesPerSecond;
    const totalMessages = Math.floor(this.testDurationMs / messageInterval);

    this.log(`Sending ${totalMessages} messages over ${this.testDurationMs/1000} seconds...`);

    for (let i = 0; i < totalMessages; i++) {
      const delay = i * messageInterval;
      const instanceName = initialHealth.instanceCount > 0 ?
        `test_instance_${i % Math.min(initialHealth.instanceCount, 10)}` :
        'default_test';

      const messageType = i % 5 === 0 ? 'audio' : 'text'; // 20% audio messages

      testPromises.push(
        new Promise(resolve => {
          setTimeout(async () => {
            const result = await this.simulateWebhookLoad(instanceName, messageType);
            resolve(result);
          }, delay);
        })
      );
    }

    // Executar todos os testes
    this.log('Executing load test...');
    const results = await Promise.all(testPromises);

    this.metrics.endTime = Date.now();

    // Health check final
    const finalHealth = await this.checkSystemHealth();

    // Gerar relatório
    this.generateReport(initialHealth, finalHealth, results);
  }

  generateReport(initialHealth, finalHealth, results) {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    const avgResponseTime = this.metrics.responseTimeSum / this.metrics.totalRequests;
    const throughput = this.metrics.totalRequests / duration;
    const successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;

    console.log('\n' + '='.repeat(80));
    console.log('📊 LOAD TEST RESULTS - Evolution API Lite');
    console.log('='.repeat(80));

    console.log('\n🔢 Test Configuration:');
    console.log(`  Target Instances: ${this.maxInstances}`);
    console.log(`  Messages/Second: ${this.messagesPerSecond}`);
    console.log(`  Test Duration: ${duration.toFixed(2)}s`);

    console.log('\n📈 Performance Metrics:');
    console.log(`  Total Requests: ${this.metrics.totalRequests}`);
    console.log(`  Successful: ${this.metrics.successfulRequests} (${successRate.toFixed(2)}%)`);
    console.log(`  Failed: ${this.metrics.failedRequests}`);
    console.log(`  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  Throughput: ${throughput.toFixed(2)} req/s`);

    if (Object.keys(this.metrics.errors).length > 0) {
      console.log('\n❌ Error Distribution:');
      Object.entries(this.metrics.errors).forEach(([error, count]) => {
        console.log(`  ${error}: ${count} occurrences`);
      });
    }

    console.log('\n🏥 System Health:');
    console.log('  Initial State:');
    console.log(`    Instances: ${initialHealth?.instanceCount || 0} (${initialHealth?.activeInstances || 0} active)`);
    console.log(`    Queue: ${JSON.stringify(initialHealth?.queueStats || 'N/A')}`);

    console.log('  Final State:');
    console.log(`    Instances: ${finalHealth?.instanceCount || 0} (${finalHealth?.activeInstances || 0} active)`);
    console.log(`    Queue: ${JSON.stringify(finalHealth?.queueStats || 'N/A')}`);

    // Análise de Performance
    console.log('\n🎯 Performance Analysis:');
    if (successRate >= 99) {
      console.log('  ✅ EXCELLENT - Success rate above 99%');
    } else if (successRate >= 95) {
      console.log('  ✅ GOOD - Success rate above 95%');
    } else if (successRate >= 90) {
      console.log('  ⚠️  ACCEPTABLE - Success rate above 90%');
    } else {
      console.log('  ❌ POOR - Success rate below 90%');
    }

    if (avgResponseTime <= 100) {
      console.log('  ✅ FAST - Average response time under 100ms');
    } else if (avgResponseTime <= 500) {
      console.log('  ✅ ACCEPTABLE - Average response time under 500ms');
    } else if (avgResponseTime <= 1000) {
      console.log('  ⚠️  SLOW - Average response time under 1s');
    } else {
      console.log('  ❌ VERY SLOW - Average response time over 1s');
    }

    console.log('\n💡 Recommendations:');
    if (successRate < 95) {
      console.log('  - Investigate error patterns and optimize error handling');
    }
    if (avgResponseTime > 500) {
      console.log('  - Consider optimizing database queries and webhook delivery');
    }
    if (throughput < this.messagesPerSecond * 0.8) {
      console.log('  - System may be under-performing, check resource constraints');
    }

    // Salvar relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      config: {
        maxInstances: this.maxInstances,
        messagesPerSecond: this.messagesPerSecond,
        testDurationMs: this.testDurationMs
      },
      metrics: this.metrics,
      health: { initial: initialHealth, final: finalHealth },
      analysis: {
        duration,
        avgResponseTime,
        throughput,
        successRate
      }
    };

    fs.writeFileSync('load-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: load-test-report.json');
    console.log('='.repeat(80));
  }

  async testSingleEndpoint(method, endpoint, data = null) {
    const startTime = Date.now();
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: { apikey: this.apiKey },
        timeout: 10000
      };

      if (data) {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        statusCode: response.status,
        responseTime,
        data: response.data
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        statusCode: error.response?.status,
        responseTime,
        error: error.message
      };
    }
  }

  async runEndpointTests() {
    this.log('🧪 Running endpoint tests...');

    const endpoints = [
      { method: 'GET', path: '/instance/fetchInstances', description: 'Fetch instances' },
      { method: 'GET', path: '/queue/stats', description: 'Queue statistics' },
      { method: 'GET', path: '/instance/test_instance_1/filters/audio', description: 'Get audio filters' },
      {
        method: 'PUT',
        path: '/instance/test_instance_1/filters/audio',
        data: { minDurationSeconds: 5, maxDurationSeconds: 60, enabled: true },
        description: 'Update audio filters'
      }
    ];

    console.log('\n📋 Endpoint Test Results:');
    console.log('-'.repeat(80));

    for (const endpoint of endpoints) {
      const result = await this.testSingleEndpoint(endpoint.method, endpoint.path, endpoint.data);
      const status = result.success ? '✅' : '❌';
      const timing = `${result.responseTime}ms`;

      console.log(`${status} ${endpoint.method.padEnd(4)} ${endpoint.path.padEnd(35)} ${timing.padStart(8)} ${endpoint.description}`);

      if (!result.success) {
        console.log(`    Error: ${result.error} (HTTP ${result.statusCode})`);
      }
    }
  }
}

// Configurações via argumentos de linha de comando
const args = process.argv.slice(2);
const config = {
  maxInstances: parseInt(args.find(arg => arg.startsWith('--instances='))?.split('=')[1]) || 10,
  messagesPerSecond: parseInt(args.find(arg => arg.startsWith('--rps='))?.split('=')[1]) || 10,
  testDuration: parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1]) || 60,
  endpointTestOnly: args.includes('--endpoint-test-only')
};

async function main() {
  const loadTest = new LoadTestRunner();
  loadTest.maxInstances = config.maxInstances;
  loadTest.messagesPerSecond = config.messagesPerSecond;
  loadTest.testDurationMs = config.testDuration * 1000;

  console.log('🚀 Evolution API Lite - Load Testing Tool');
  console.log(`Configuration: ${config.maxInstances} instances, ${config.messagesPerSecond} msg/s, ${config.testDuration}s`);
  console.log('');

  try {
    // Sempre executar testes de endpoint
    await loadTest.runEndpointTests();

    if (!config.endpointTestOnly) {
      // Executar teste de carga completo
      await loadTest.runLoadTest();
    } else {
      console.log('\n✅ Endpoint tests completed. Use --rps=X --duration=Y for full load test.');
    }

  } catch (error) {
    console.error('Load test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LoadTestRunner };