import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('create_notification')
  async create(@Payload() payload: any) {
    console.log('MessagePattern-data:', JSON.stringify(payload, null, 2));
  }
}
