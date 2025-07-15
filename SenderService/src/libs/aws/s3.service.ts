import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { S3Config } from './config/s3-config.type';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.s3Client = new S3Client({
      region: this.configService.get<S3Config>('awsS3').region,
      credentials: {
        accessKeyId: this.configService.get<S3Config>('awsS3').accessKeyId,
        secretAccessKey:
          this.configService.get<S3Config>('awsS3').secretAccessKey,
      },
    });

    this.bucketName = this.configService.get<S3Config>('awsS3').bucketName;
  }

  async uploadFile() {}

  async deleteFile() {}
}
