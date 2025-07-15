import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RabbitMQModule } from 'src/libs/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
