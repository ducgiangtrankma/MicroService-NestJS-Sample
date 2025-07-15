import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';

@Injectable()
export class PresenceService implements OnModuleInit {
  constructor(
    @Inject('NOTIFICATION_QUEUE') private readonly client: ClientProxy,
    @Inject('USER-REDIS') private readonly useRedisClient: Redis,
  ) {}
  async onModuleInit() {
    this.useRedisClient.on('error', (err) =>
      console.error('Redis Error:', err),
    );

    this.useRedisClient.on('end', () => console.warn('Redis connection lost'));

    this.useRedisClient.on('message', (channel, message) => {
      this.handleRedisMessage(channel, message);
    });
    this.useRedisClient.subscribe('presence-online');
    this.useRedisClient.subscribe('presence-offline');
  }
  private handleRedisMessage(channel: string, message: string) {
    const messageData = JSON.parse(message) as { userId: string };
    console.log('handleRedisMessage-channel', channel);
    console.log('messageData', messageData);
    this.client.emit('create_notification', {
      userId: messageData.userId,
    });
  }
}
