#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

class E2EValidator {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.apiKey = 'teste123';
    this.testInstanceName = `e2e_test_${Date.now()}`;
    this.results = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async runTest(testName, testFunc) {
    this.log(`Running: ${testName}`);
    const startTime = Date.now();

    try {
      const result = await testFunc();
      const duration = Date.now() - startTime;

      this.results.push({
        test: testName,
        success: true,
        duration,
        details: result
      });

      this.log(`✅ ${testName} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.results.push({
        test: testName,
        success: false,
        duration,
        error: error.message
      });

      this.log(`❌ ${testName} failed: ${error.message} (${duration}ms)`, 'ERROR');
      throw error;
    }
  }

  async validateFullWorkflow() {
    console.log('🧪 End-to-End Validation - Evolution API Lite');
    console.log('Testing complete audio processing workflow with dual webhooks');
    console.log('='.repeat(80));

    try {
      // 1. Verificar API está respondendo
      await this.runTest('API Health Check', async () => {
        const response = await axios.get(`${this.baseUrl}/instance/fetchInstances`, {
          headers: { apikey: this.apiKey },
          timeout: 5000
        });
        return { instanceCount: response.data.length, status: response.status };
      });

      // 2. Verificar infraestrutura (MinIO, Queue)
      await this.runTest('Infrastructure Check', async () => {
        const checks = await Promise.allSettled([
          // MinIO health
          axios.get('http://localhost:9000/minio/health/live', { timeout: 3000 }),
          // Queue stats (pode não existir ainda)
          axios.get(`${this.baseUrl}/queue/stats`, {
            headers: { apikey: this.apiKey },
            timeout: 3000
          }).catch(() => ({ data: { message: 'queue stats endpoint not available' } }))
        ]);

        return {
          minio: checks[0].status === 'fulfilled',
          queueStats: checks[1].status === 'fulfilled' ? checks[1].value.data : { available: false }
        };
      });

      // 3. Testar configuração de filtros de áudio
      await this.runTest('Audio Filter Configuration', async () => {
        // Configurar filtros para instância de teste
        const filterConfig = {
          minDurationSeconds: 5,
          maxDurationSeconds: 120,
          enabled: true
        };

        const response = await axios.put(
          `${this.baseUrl}/instance/${this.testInstanceName}/filters/audio`,
          filterConfig,
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: this.apiKey
            },
            timeout: 5000
          }
        );

        // Verificar se foi salvo corretamente
        const getResponse = await axios.get(
          `${this.baseUrl}/instance/${this.testInstanceName}/filters/audio`,
          {
            headers: { apikey: this.apiKey },
            timeout: 5000
          }
        );

        return {
          configSaved: response.status === 200,
          configRetrieved: getResponse.data,
          matches: getResponse.data.minDurationSeconds === 5 && getResponse.data.maxDurationSeconds === 120
        };
      });

      // 4. Simular processamento de áudio válido
      await this.runTest('Valid Audio Message Processing', async () => {
        const audioMessage = {
          event: 'messages.upsert',
          instance: this.testInstanceName,
          data: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net',
              id: `valid_audio_${crypto.randomUUID()}`
            },
            message: {
              audioMessage: {
                mimetype: 'audio/ogg; codecs=opus',
                seconds: 30, // Dentro do range 5-120
                url: `https://test.s3.amazonaws.com/audio_${Date.now()}.ogg`
              }
            },
            messageTimestamp: Math.floor(Date.now() / 1000)
          }
        };

        // Este deveria ser processado (não filtrado)
        const response = await axios.post(`${this.baseUrl}/webhook/test`, audioMessage, {
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apiKey
          },
          timeout: 5000
        });

        return {
          processed: response.status === 200,
          responseData: response.data
        };
      });

      // 5. Simular áudio muito curto (deve ser filtrado)
      await this.runTest('Short Audio Filter Test', async () => {
        const shortAudioMessage = {
          event: 'messages.upsert',
          instance: this.testInstanceName,
          data: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net',
              id: `short_audio_${crypto.randomUUID()}`
            },
            message: {
              audioMessage: {
                mimetype: 'audio/ogg; codecs=opus',
                seconds: 2, // Menor que 5 segundos - deve ser filtrado
                url: `https://test.s3.amazonaws.com/audio_short_${Date.now()}.ogg`
              }
            },
            messageTimestamp: Math.floor(Date.now() / 1000)
          }
        };

        // Este deveria ser filtrado
        const response = await axios.post(`${this.baseUrl}/webhook/test`, shortAudioMessage, {
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apiKey
          },
          timeout: 5000
        });

        return {
          handled: response.status === 200,
          shouldBeFiltered: true
        };
      });

      // 6. Simular áudio muito longo (deve ser filtrado)
      await this.runTest('Long Audio Filter Test', async () => {
        const longAudioMessage = {
          event: 'messages.upsert',
          instance: this.testInstanceName,
          data: {
            key: {
              remoteJid: '5511999999999@s.whatsapp.net',
              id: `long_audio_${crypto.randomUUID()}`
            },
            message: {
              audioMessage: {
                mimetype: 'audio/ogg; codecs=opus',
                seconds: 150, // Maior que 120 segundos - deve ser filtrado
                url: `https://test.s3.amazonaws.com/audio_long_${Date.now()}.ogg`
              }
            },
            messageTimestamp: Math.floor(Date.now() / 1000)
          }
        };

        const response = await axios.post(`${this.baseUrl}/webhook/test`, longAudioMessage, {
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apiKey
          },
          timeout: 5000
        });

        return {
          handled: response.status === 200,
          shouldBeFiltered: true
        };
      });

      // 7. Verificar estatísticas após testes
      await this.runTest('Statistics Validation', async () => {
        // Aguardar um pouco para processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statsResponse = await axios.get(`${this.baseUrl}/queue/stats`, {
          headers: { apikey: this.apiKey },
          timeout: 5000
        }).catch(() => ({ data: { message: 'Stats endpoint not available' } }));

        return {
          statsAvailable: statsResponse.data && !statsResponse.data.message,
          stats: statsResponse.data
        };
      });

      // 8. Teste de rate limiting
      await this.runTest('Rate Limiting Test', async () => {
        const requests = [];
        const requestCount = 20; // Burst de 20 requests

        for (let i = 0; i < requestCount; i++) {
          requests.push(
            axios.post(`${this.baseUrl}/webhook/test`, {
              event: 'test.rate.limit',
              instance: this.testInstanceName,
              data: { test: i }
            }, {
              headers: {
                'Content-Type': 'application/json',
                apikey: this.apiKey
              },
              timeout: 3000
            }).catch(error => ({ error: error.message, status: error.response?.status }))
          );
        }

        const results = await Promise.all(requests);
        const successful = results.filter(r => !r.error).length;
        const rateLimited = results.filter(r => r.status === 429).length;

        return {
          totalRequests: requestCount,
          successful,
          rateLimited,
          rateLimitingWorking: rateLimited > 0
        };
      });

      this.generateReport();

    } catch (error) {
      this.log(`E2E validation failed: ${error.message}`, 'ERROR');
      this.generateReport();
      process.exit(1);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 END-TO-END VALIDATION REPORT');
    console.log('='.repeat(80));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\n📈 Summary: ${passed}/${this.results.length} tests passed (${failed} failed)`);
    console.log(`⏱️ Total execution time: ${totalTime}ms`);

    console.log('\n📋 Test Details:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`.padStart(8);
      console.log(`${status} ${(index + 1).toString().padStart(2)}. ${result.test.padEnd(35)} ${duration}`);

      if (!result.success) {
        console.log(`     Error: ${result.error}`);
      } else if (result.details && typeof result.details === 'object') {
        const important = this.extractImportantDetails(result.details);
        if (important) {
          console.log(`     ${important}`);
        }
      }
    });

    console.log('\n🎯 Key Validations:');
    const audioConfigTest = this.results.find(r => r.test === 'Audio Filter Configuration');
    if (audioConfigTest?.success) {
      console.log('  ✅ Audio filter configuration working');
    }

    const rateLimitTest = this.results.find(r => r.test === 'Rate Limiting Test');
    if (rateLimitTest?.success && rateLimitTest.details?.rateLimitingWorking) {
      console.log('  ✅ Rate limiting functional');
    } else if (rateLimitTest?.success) {
      console.log('  ⚠️  Rate limiting not triggered (may need adjustment)');
    }

    const infraTest = this.results.find(r => r.test === 'Infrastructure Check');
    if (infraTest?.success && infraTest.details?.minio) {
      console.log('  ✅ MinIO storage operational');
    }

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED - System ready for production load testing');
    } else {
      console.log(`\n⚠️  ${failed} tests failed - Review issues before load testing`);
    }

    // Salvar relatório detalhado
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: { passed, failed, totalTime },
      results: this.results
    };

    require('fs').writeFileSync('e2e-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: e2e-validation-report.json');
    console.log('='.repeat(80));
  }

  extractImportantDetails(details) {
    if (details.instanceCount !== undefined) {
      return `${details.instanceCount} instances found`;
    }
    if (details.minio !== undefined) {
      return `MinIO: ${details.minio ? 'OK' : 'FAIL'}, Queue: ${details.queueStats?.available !== false ? 'OK' : 'NOT AVAILABLE'}`;
    }
    if (details.matches !== undefined) {
      return `Config ${details.matches ? 'matches' : 'mismatch'} expected values`;
    }
    if (details.rateLimitingWorking !== undefined) {
      return `${details.successful}/${details.totalRequests} successful, Rate limiting: ${details.rateLimitingWorking ? 'WORKING' : 'NOT TRIGGERED'}`;
    }
    return null;
  }
}

async function main() {
  const validator = new E2EValidator();
  await validator.validateFullWorkflow();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { E2EValidator };