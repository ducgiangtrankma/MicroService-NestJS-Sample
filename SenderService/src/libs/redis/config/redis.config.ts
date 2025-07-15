import { IsString } from 'class-validator';
import { RedisConfig } from './redis-config.type';
import validateConfig from 'src/utils/validate-config';
import { registerAs } from '@nestjs/config';

class EnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  DATABASE_PASS: string;
}
export default registerAs<RedisConfig>('redis', () => {
  console.info(`Register Redis Config from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  const port = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT, 10)
    : process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : 6380;
  return {
    host: process.env.REDIS_HOST,
    port,
    password: process.env.REDIS_PASSWORD,
  };
});
