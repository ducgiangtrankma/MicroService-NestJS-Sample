import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { S3Config } from './s3-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_REGION: string;

  @IsString()
  AWS_BUCKET_NAME: string;
}

export default registerAs<S3Config>('awsS3', () => {
  console.info(`Register AWS S3 config from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  };
});
