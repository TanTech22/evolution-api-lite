import { ConfigService, S3 } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { BadRequestException } from '@exceptions';
import * as MinIo from 'minio';
import { join } from 'path';
import { Readable, Transform } from 'stream';

const logger = new Logger('S3 Service');

const BUCKET = new ConfigService().get<S3>('S3');

interface Metadata extends MinIo.ItemBucketMetadata {
  'Content-Type': string;
}

const minioClient = (() => {
  if (BUCKET?.ENABLE) {
    return new MinIo.Client({
      endPoint: BUCKET.ENDPOINT,
      port: BUCKET.PORT,
      useSSL: BUCKET.USE_SSL,
      accessKey: BUCKET.ACCESS_KEY,
      secretKey: BUCKET.SECRET_KEY,
      region: BUCKET.REGION,
    });
  }
})();

const bucketName = BUCKET?.BUCKET_NAME || process.env.S3_BUCKET;

const bucketExists = async () => {
  if (minioClient) {
    try {
      const list = await minioClient.listBuckets();
      return list.find((bucket) => bucket.name === bucketName);
    } catch (error) {
      return false;
    }
  }
};

const setBucketPolicy = async () => {
  if (minioClient) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
};

const createBucket = async () => {
  if (minioClient) {
    try {
      const exists = await bucketExists();
      if (!exists) {
        await minioClient.makeBucket(bucketName);
      }

      await setBucketPolicy();

      logger.info(`S3 Bucket ${bucketName} - ON`);
      return true;
    } catch (error) {
      logger.error('S3 ERROR:');
      logger.error(error);
      return false;
    }
  }
};

// Só tenta criar bucket se S3 estiver habilitado
if (BUCKET?.ENABLE) {
  createBucket();
}

const uploadFile = async (fileName: string, file: Buffer | Transform | Readable, size: number, metadata: Metadata) => {
  if (minioClient) {
    const objectName = join('evolution-api', fileName);
    try {
      metadata['custom-header-application'] = 'evolution-api';
      return await minioClient.putObject(bucketName, objectName, file, size, metadata);
    } catch (error) {
      logger.error(error);
      return error;
    }
  }
};

const getObjectUrl = async (fileName: string, expiry?: number) => {
  if (minioClient) {
    try {
      const objectName = join('evolution-api', fileName);
      if (expiry) {
        return await minioClient.presignedGetObject(bucketName, objectName, expiry);
      }
      return await minioClient.presignedGetObject(bucketName, objectName);
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
};

const uploadTempFile = async (
  folder: string,
  fileName: string,
  file: Buffer | Transform | Readable,
  size: number,
  metadata: Metadata,
) => {
  if (minioClient) {
    const objectName = join(folder, fileName);
    try {
      metadata['custom-header-application'] = 'evolution-api';
      return await minioClient.putObject(bucketName, objectName, file, size, metadata);
    } catch (error) {
      logger.error(error);
      return error;
    }
  }
};

const deleteFile = async (folder: string, fileName: string) => {
  if (minioClient) {
    const objectName = join(folder, fileName);
    try {
      return await minioClient.removeObject(bucketName, objectName);
    } catch (error) {
      logger.error(error);
      return error;
    }
  }
};

const cleanupOldAudioFiles = async (maxAgeInDays: number) => {
  if (!minioClient) {
    logger.error('MinIO client not available for cleanup');
    return { success: false, error: 'MinIO client not available' };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    const stream = minioClient.listObjectsV2(bucketName, 'evolution-api/', true);
    let deletedCount = 0;
    let errorCount = 0;

    for await (const obj of stream) {
      // Only process audio files
      if (obj.name && obj.name.includes('/audio/') && obj.lastModified && obj.lastModified < cutoffDate) {
        try {
          await minioClient.removeObject(bucketName, obj.name);
          deletedCount++;
          logger.verbose(`Deleted old audio file: ${obj.name}`);
        } catch (error) {
          errorCount++;
          logger.error(`Failed to delete audio file ${obj.name}: ${error.message}`);
        }
      }
    }

    logger.info(`Audio cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
    return {
      success: true,
      deletedCount,
      errorCount,
      cutoffDate: cutoffDate.toISOString()
    };

  } catch (error) {
    logger.error(`Audio cleanup failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export { BUCKET, deleteFile, getObjectUrl, uploadFile, uploadTempFile, cleanupOldAudioFiles };
