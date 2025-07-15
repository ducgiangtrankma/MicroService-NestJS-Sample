import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async processNotification(payload: any) {
    this.logger.log(
      'Processing notification with payload:',
      JSON.stringify(payload, null, 2),
    );

    // Thêm logic xử lý notification của bạn ở đây
    // Ví dụ: gửi email, push notification, v.v.

    return {
      success: true,
      message: 'Notification processed successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
