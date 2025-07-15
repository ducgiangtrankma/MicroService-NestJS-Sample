import { registerAs } from '@nestjs/config';
import { IsString, ValidateIf } from 'class-validator';
import { RabbitMqConfig } from './rabbitmq-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  RABBITMQ_USER: string;

  @IsString()
  RABBITMQ_PASSWORD: string;

  @IsString()
  RABBITMQ_NAME: string;
}

export default registerAs<RabbitMqConfig>('rabbitmq', () => {
  console.info(`Register RabbitMQ config from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    url: process.env.RABBITMQ_URL,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    queueName: process.env.RABBITMQ_NAME,
  };
});
