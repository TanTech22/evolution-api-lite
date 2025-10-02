#!/usr/bin/env node

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);

class RealtimeMonitor {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.apiKey = 'teste123';
    this.minioUrl = 'http://localhost:9000';
    this.interval = 5000; // 5 segundos
    this.isRunning = false;
    this.metrics = {
      history: [],
      alerts: [],
      startTime: Date.now()
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    console.log(logEntry);

    // Append to log file
    fs.appendFileSync('realtime-monitor.log', logEntry + '\n');
  }

  async getSystemMetrics() {
    try {
      // CPU e memória do sistema
      const { stdout: memInfo } = await execAsync('free -m');
      const { stdout: loadInfo } = await execAsync('uptime');
      const { stdout: diskInfo } = await execAsync('df -h /');

      const memLines = memInfo.trim().split('\n');
      const memData = memLines[1].split(/\s+/);
      const totalMem = parseInt(memData[1]);
      const usedMem = parseInt(memData[2]);
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      const loadMatch = loadInfo.match(/load average: ([\d.]+)/);
      const load = loadMatch ? parseFloat(loadMatch[1]) : 0;

      const diskLines = diskInfo.trim().split('\n');
      const diskData = diskLines[1].split(/\s+/);
      const diskUsed = diskData[4];

      return {
        memory: {
          total: totalMem,
          used: usedMem,
          percent: parseFloat(memPercent)
        },
        load: load,
        disk: {
          used: diskUsed
        }
      };
    } catch (error) {
      this.log(`Failed to get system metrics: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async getProcessMetrics() {
    try {
      // Processos Evolution API
      const { stdout: psOutput } = await execAsync('ps aux | grep -E "(evolution|main.ts|minio)" | grep -v grep');

      const processes = psOutput.trim().split('\n').map(line => {
        const parts = line.split(/\s+/);
        return {
          user: parts[0],
          pid: parseInt(parts[1]),
          cpu: parseFloat(parts[2]),
          mem: parseFloat(parts[3]),
          command: parts.slice(10).join(' ')
        };
      }).filter(p => p.pid);

      const evolutionProcs = processes.filter(p => p.command.includes('main.ts') || p.command.includes('evolution'));
      const minioProcs = processes.filter(p => p.command.includes('minio'));

      return {
        evolution: evolutionProcs,
        minio: minioProcs,
        totalEvolutionCpu: evolutionProcs.reduce((sum, p) => sum + p.cpu, 0),
        totalEvolutionMem: evolutionProcs.reduce((sum, p) => sum + p.mem, 0)
      };
    } catch (error) {
      this.log(`Failed to get process metrics: ${error.message}`, 'ERROR');
      return { evolution: [], minio: [], totalEvolutionCpu: 0, totalEvolutionMem: 0 };
    }
  }

  async getNetworkMetrics() {
    try {
      // Conexões de rede ativas
      const { stdout: netstatOutput } = await execAsync('netstat -an | grep -E ":8080|:9000"');

      const connections = netstatOutput.trim().split('\n').reduce((acc, line) => {
        if (line.includes(':8080')) {
          acc.api = acc.api || { established: 0, listening: 0 };
          if (line.includes('ESTABLISHED')) acc.api.established++;
          if (line.includes('LISTEN')) acc.api.listening++;
        }
        if (line.includes(':9000')) {
          acc.minio = acc.minio || { established: 0, listening: 0 };
          if (line.includes('ESTABLISHED')) acc.minio.established++;
          if (line.includes('LISTEN')) acc.minio.listening++;
        }
        return acc;
      }, {});

      return connections;
    } catch (error) {
      this.log(`Failed to get network metrics: ${error.message}`, 'ERROR');
      return {};
    }
  }

  async getApplicationMetrics() {
    try {
      const [instancesResponse, queueStatsResponse] = await Promise.allSettled([
        axios.get(`${this.baseUrl}/instance/fetchInstances`, {
          headers: { apikey: this.apiKey },
          timeout: 5000
        }),
        axios.get(`${this.baseUrl}/queue/stats`, {
          headers: { apikey: this.apiKey },
          timeout: 5000
        })
      ]);

      const instances = instancesResponse.status === 'fulfilled' ? instancesResponse.value.data : [];
      const queueStats = queueStatsResponse.status === 'fulfilled' ? queueStatsResponse.value.data : null;

      const activeInstances = instances.filter(i => i.connectionStatus === 'open');

      return {
        instances: {
          total: instances.length,
          active: activeInstances.length,
          connecting: instances.filter(i => i.connectionStatus === 'connecting').length,
          disconnected: instances.filter(i => i.connectionStatus === 'close').length
        },
        queue: queueStats,
        totalMessages: instances.reduce((sum, i) => sum + (i._count?.Message || 0), 0)
      };
    } catch (error) {
      this.log(`Failed to get application metrics: ${error.message}`, 'ERROR');
      return { instances: { total: 0, active: 0, connecting: 0, disconnected: 0 }, queue: null, totalMessages: 0 };
    }
  }

  async checkHealthEndpoints() {
    const checks = {
      api: { healthy: false, responseTime: 0 },
      minio: { healthy: false, responseTime: 0 }
    };

    // API Health
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.baseUrl}/instance/fetchInstances`, {
        headers: { apikey: this.apiKey },
        timeout: 3000
      });
      checks.api.responseTime = Date.now() - startTime;
      checks.api.healthy = response.status === 200;
    } catch (error) {
      checks.api.healthy = false;
      checks.api.error = error.message;
    }

    // MinIO Health
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.minioUrl}/minio/health/live`, {
        timeout: 3000
      });
      checks.minio.responseTime = Date.now() - startTime;
      checks.minio.healthy = response.status === 200;
    } catch (error) {
      checks.minio.healthy = false;
      checks.minio.error = error.message;
    }

    return checks;
  }

  analyzeMetrics(current) {
    const alerts = [];

    // CPU alerts
    if (current.processes.totalEvolutionCpu > 80) {
      alerts.push({ level: 'HIGH', message: `High CPU usage: ${current.processes.totalEvolutionCpu.toFixed(1)}%` });
    } else if (current.processes.totalEvolutionCpu > 60) {
      alerts.push({ level: 'MEDIUM', message: `Elevated CPU usage: ${current.processes.totalEvolutionCpu.toFixed(1)}%` });
    }

    // Memory alerts
    if (current.system.memory.percent > 85) {
      alerts.push({ level: 'HIGH', message: `High memory usage: ${current.system.memory.percent}%` });
    } else if (current.system.memory.percent > 70) {
      alerts.push({ level: 'MEDIUM', message: `Elevated memory usage: ${current.system.memory.percent}%` });
    }

    // Connection alerts
    if (current.network.api?.established > 100) {
      alerts.push({ level: 'MEDIUM', message: `High API connections: ${current.network.api.established}` });
    }

    // Response time alerts
    if (current.health.api.responseTime > 1000) {
      alerts.push({ level: 'HIGH', message: `Slow API response: ${current.health.api.responseTime}ms` });
    } else if (current.health.api.responseTime > 500) {
      alerts.push({ level: 'MEDIUM', message: `Elevated API response time: ${current.health.api.responseTime}ms` });
    }

    // Instance alerts
    if (current.app.instances.disconnected > 0) {
      alerts.push({ level: 'MEDIUM', message: `${current.app.instances.disconnected} instances disconnected` });
    }

    return alerts;
  }

  displayMetrics(metrics) {
    // Clear screen
    console.clear();

    const uptime = ((Date.now() - this.metrics.startTime) / 1000).toFixed(0);

    console.log('🔄 Evolution API Lite - Real-time Performance Monitor');
    console.log(`⏱️  Uptime: ${uptime}s | Last Update: ${new Date().toLocaleTimeString()}`);
    console.log('='.repeat(80));

    // System
    console.log('\n📊 System Resources:');
    if (metrics.system) {
      console.log(`   Memory: ${metrics.system.memory.used}MB/${metrics.system.memory.total}MB (${metrics.system.memory.percent}%)`);
      console.log(`   Load: ${metrics.system.load}`);
      console.log(`   Disk: ${metrics.system.disk.used}`);
    }

    // Processes
    console.log('\n🚀 Process Performance:');
    if (metrics.processes.evolution.length > 0) {
      console.log(`   Evolution API: ${metrics.processes.totalEvolutionCpu.toFixed(1)}% CPU, ${metrics.processes.totalEvolutionMem.toFixed(1)}% MEM`);
      console.log(`   Processes: ${metrics.processes.evolution.length} running`);
    } else {
      console.log('   ❌ Evolution API: Not running');
    }

    if (metrics.processes.minio.length > 0) {
      const minioCpu = metrics.processes.minio.reduce((sum, p) => sum + p.cpu, 0);
      const minioMem = metrics.processes.minio.reduce((sum, p) => sum + p.mem, 0);
      console.log(`   MinIO: ${minioCpu.toFixed(1)}% CPU, ${minioMem.toFixed(1)}% MEM`);
    } else {
      console.log('   ❌ MinIO: Not running');
    }

    // Application
    console.log('\n📱 Application Status:');
    if (metrics.app) {
      console.log(`   Instances: ${metrics.app.instances.active}/${metrics.app.instances.total} active`);
      console.log(`   Messages: ${metrics.app.totalMessages} total`);

      if (metrics.app.queue) {
        console.log(`   Queue Size: ${metrics.app.queue.queueSize || 'N/A'}`);
        console.log(`   Processed: ${metrics.app.queue.processedToday || 'N/A'}`);
      }
    }

    // Network
    console.log('\n🌐 Network Connections:');
    if (metrics.network.api) {
      console.log(`   API (8080): ${metrics.network.api.established} active, ${metrics.network.api.listening} listening`);
    }
    if (metrics.network.minio) {
      console.log(`   MinIO (9000): ${metrics.network.minio.established} active, ${metrics.network.minio.listening} listening`);
    }

    // Health
    console.log('\n💚 Health Status:');
    const apiStatus = metrics.health.api.healthy ? '✅' : '❌';
    const minioStatus = metrics.health.minio.healthy ? '✅' : '❌';
    console.log(`   ${apiStatus} Evolution API (${metrics.health.api.responseTime}ms)`);
    console.log(`   ${minioStatus} MinIO Storage (${metrics.health.minio.responseTime}ms)`);

    // Alerts
    if (metrics.alerts && metrics.alerts.length > 0) {
      console.log('\n🚨 Active Alerts:');
      metrics.alerts.forEach(alert => {
        const icon = alert.level === 'HIGH' ? '🔴' : '🟡';
        console.log(`   ${icon} ${alert.message}`);
      });
    }

    console.log('\n📝 Press Ctrl+C to stop monitoring');
  }

  async collectMetrics() {
    try {
      const [system, processes, network, app, health] = await Promise.all([
        this.getSystemMetrics(),
        this.getProcessMetrics(),
        this.getNetworkMetrics(),
        this.getApplicationMetrics(),
        this.checkHealthEndpoints()
      ]);

      const current = {
        timestamp: Date.now(),
        system,
        processes,
        network,
        app,
        health
      };

      current.alerts = this.analyzeMetrics(current);

      // Salvar no histórico (manter últimos 60 pontos = 5 minutos)
      this.metrics.history.push(current);
      if (this.metrics.history.length > 60) {
        this.metrics.history.shift();
      }

      // Adicionar alertas únicos
      current.alerts.forEach(alert => {
        const existing = this.metrics.alerts.find(a => a.message === alert.message);
        if (!existing) {
          this.metrics.alerts.push({ ...alert, timestamp: Date.now() });
        }
      });

      // Remover alertas antigos (> 5 minutos)
      this.metrics.alerts = this.metrics.alerts.filter(alert =>
        Date.now() - alert.timestamp < 300000
      );

      return current;
    } catch (error) {
      this.log(`Failed to collect metrics: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async start() {
    this.log('🚀 Starting real-time performance monitor');
    this.isRunning = true;

    // Setup graceful shutdown
    process.on('SIGINT', () => {
      this.isRunning = false;
      this.generateFinalReport();
      process.exit(0);
    });

    while (this.isRunning) {
      const metrics = await this.collectMetrics();
      if (metrics) {
        this.displayMetrics(metrics);
      }

      await new Promise(resolve => setTimeout(resolve, this.interval));
    }
  }

  generateFinalReport() {
    console.clear();
    console.log('\n' + '='.repeat(80));
    console.log('📊 REAL-TIME MONITORING FINAL REPORT');
    console.log('='.repeat(80));

    if (this.metrics.history.length === 0) {
      console.log('No metrics collected');
      return;
    }

    const duration = (Date.now() - this.metrics.startTime) / 1000;
    const samples = this.metrics.history.length;

    // Calcular médias
    const avgCpu = this.metrics.history.reduce((sum, m) => sum + (m.processes?.totalEvolutionCpu || 0), 0) / samples;
    const avgMem = this.metrics.history.reduce((sum, m) => sum + (m.system?.memory?.percent || 0), 0) / samples;
    const avgLoad = this.metrics.history.reduce((sum, m) => sum + (m.system?.load || 0), 0) / samples;

    // Picos
    const maxCpu = Math.max(...this.metrics.history.map(m => m.processes?.totalEvolutionCpu || 0));
    const maxMem = Math.max(...this.metrics.history.map(m => m.system?.memory?.percent || 0));
    const maxLoad = Math.max(...this.metrics.history.map(m => m.system?.load || 0));

    // Instâncias
    const latestApp = this.metrics.history[this.metrics.history.length - 1]?.app;

    console.log(`\n⏱️ Monitoring Duration: ${duration.toFixed(0)}s (${samples} samples)`);

    console.log('\n📊 Performance Averages:');
    console.log(`   CPU (Evolution): ${avgCpu.toFixed(1)}% (peak: ${maxCpu.toFixed(1)}%)`);
    console.log(`   Memory (System): ${avgMem.toFixed(1)}% (peak: ${maxMem.toFixed(1)}%)`);
    console.log(`   Load Average: ${avgLoad.toFixed(2)} (peak: ${maxLoad.toFixed(2)})`);

    if (latestApp) {
      console.log('\n📱 Application Status:');
      console.log(`   Active Instances: ${latestApp.instances.active}/${latestApp.instances.total}`);
      console.log(`   Total Messages: ${latestApp.totalMessages}`);
    }

    if (this.metrics.alerts.length > 0) {
      console.log('\n🚨 Alerts Summary:');
      const alertCounts = this.metrics.alerts.reduce((acc, alert) => {
        acc[alert.level] = (acc[alert.level] || 0) + 1;
        return acc;
      }, {});

      Object.entries(alertCounts).forEach(([level, count]) => {
        const icon = level === 'HIGH' ? '🔴' : '🟡';
        console.log(`   ${icon} ${level}: ${count} alerts`);
      });

      console.log('\n   Recent Alerts:');
      this.metrics.alerts.slice(-5).forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        const icon = alert.level === 'HIGH' ? '🔴' : '🟡';
        console.log(`   ${icon} [${time}] ${alert.message}`);
      });
    } else {
      console.log('\n✅ No alerts during monitoring period');
    }

    console.log('\n💡 Performance Assessment:');
    if (maxCpu < 50 && maxMem < 70) {
      console.log('   ✅ EXCELLENT - System performing well under current load');
    } else if (maxCpu < 80 && maxMem < 85) {
      console.log('   ✅ GOOD - System handling load adequately');
    } else {
      console.log('   ⚠️  STRESSED - System approaching resource limits');
    }

    // Salvar relatório detalhado
    const reportData = {
      timestamp: new Date().toISOString(),
      duration,
      samples,
      averages: { cpu: avgCpu, memory: avgMem, load: avgLoad },
      peaks: { cpu: maxCpu, memory: maxMem, load: maxLoad },
      alerts: this.metrics.alerts,
      history: this.metrics.history
    };

    fs.writeFileSync('realtime-monitor-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: realtime-monitor-report.json');
    console.log('='.repeat(80));
  }
}

async function main() {
  const monitor = new RealtimeMonitor();

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node realtime-monitor.js [options]');
    console.log('Options:');
    console.log('  --interval=N   Set monitoring interval in seconds (default: 5)');
    console.log('  --help         Show this help message');
    return;
  }

  const intervalArg = args.find(arg => arg.startsWith('--interval='));
  if (intervalArg) {
    monitor.interval = parseInt(intervalArg.split('=')[1]) * 1000;
  }

  console.log('Starting real-time monitor...');
  console.log(`Monitoring interval: ${monitor.interval / 1000}s`);
  console.log('Press Ctrl+C to stop and generate final report');
  console.log('');

  await monitor.start();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealtimeMonitor };