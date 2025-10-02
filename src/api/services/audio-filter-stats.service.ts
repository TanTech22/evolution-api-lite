import { Logger } from '@config/logger.config';

interface AudioFilterStats {
  tooShort: number;
  tooLong: number;
  processed: number;
  totalFiltered: number;
  lastReset: Date;
}

interface InstanceStats {
  [instanceName: string]: AudioFilterStats;
}

export class AudioFilterStatsService {
  private static instance: AudioFilterStatsService;
  private stats: InstanceStats = {};
  private logger = new Logger('AudioFilterStats');

  public static getInstance(): AudioFilterStatsService {
    if (!AudioFilterStatsService.instance) {
      AudioFilterStatsService.instance = new AudioFilterStatsService();
    }
    return AudioFilterStatsService.instance;
  }

  private getDefaultStats(): AudioFilterStats {
    return {
      tooShort: 0,
      tooLong: 0,
      processed: 0,
      totalFiltered: 0,
      lastReset: new Date()
    };
  }

  public incrementTooShort(instanceName: string): void {
    if (!this.stats[instanceName]) {
      this.stats[instanceName] = this.getDefaultStats();
    }
    this.stats[instanceName].tooShort++;
    this.stats[instanceName].totalFiltered++;
    this.logger.log(`[${instanceName}] Audio too short - Total: ${this.stats[instanceName].tooShort}`);
  }

  public incrementTooLong(instanceName: string): void {
    if (!this.stats[instanceName]) {
      this.stats[instanceName] = this.getDefaultStats();
    }
    this.stats[instanceName].tooLong++;
    this.stats[instanceName].totalFiltered++;
    this.logger.log(`[${instanceName}] Audio too long - Total: ${this.stats[instanceName].tooLong}`);
  }

  public incrementProcessed(instanceName: string): void {
    if (!this.stats[instanceName]) {
      this.stats[instanceName] = this.getDefaultStats();
    }
    this.stats[instanceName].processed++;
    this.logger.log(`[${instanceName}] Audio processed - Total: ${this.stats[instanceName].processed}`);
  }

  public getStats(instanceName: string): AudioFilterStats {
    return this.stats[instanceName] || this.getDefaultStats();
  }

  public getAllStats(): InstanceStats {
    return { ...this.stats };
  }

  public resetStats(instanceName?: string): void {
    if (instanceName) {
      this.stats[instanceName] = this.getDefaultStats();
      this.logger.log(`[${instanceName}] Audio filter stats reset`);
    } else {
      this.stats = {};
      this.logger.log('All audio filter stats reset');
    }
  }

  public getStatsReport(instanceName: string): {
    instance: string;
    stats: AudioFilterStats;
    filterEfficiency: number;
    hourlyRate?: number;
  } {
    const instanceStats = this.getStats(instanceName);
    const total = instanceStats.processed + instanceStats.totalFiltered;
    const filterEfficiency = total > 0 ? (instanceStats.totalFiltered / total) * 100 : 0;

    // Calcular taxa por hora se há dados
    const timeDiff = new Date().getTime() - instanceStats.lastReset.getTime();
    const hoursElapsed = timeDiff / (1000 * 60 * 60);
    const hourlyRate = hoursElapsed > 0 ? total / hoursElapsed : undefined;

    return {
      instance: instanceName,
      stats: instanceStats,
      filterEfficiency: Math.round(filterEfficiency * 100) / 100,
      hourlyRate: hourlyRate ? Math.round(hourlyRate * 100) / 100 : undefined
    };
  }
}