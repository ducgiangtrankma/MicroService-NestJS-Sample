import { DatabaseConfig } from 'src/database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { RedisConfig } from 'src/libs/redis/config/redis-config.type';
import { RabbitMqConfig } from 'src/libs/rabbitmq/config/rabbitmq-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  rabbitmq: RabbitMqConfig;
};
