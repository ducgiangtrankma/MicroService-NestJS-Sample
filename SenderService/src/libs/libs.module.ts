import { Module } from '@nestjs/common';
import { AwsS3Module } from './aws/s3.module';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [RedisModule, AwsS3Module, RabbitMQModule],
  exports: [RabbitMQModule],
})
export class LibsModule {}
