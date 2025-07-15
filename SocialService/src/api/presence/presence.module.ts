import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';
import { RabbitMQModule } from 'src/libs/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule {}
