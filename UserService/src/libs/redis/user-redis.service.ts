import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class UserRedisService {
  constructor(@Inject('USER_REDIS') private readonly userRedisClient: Redis) {}

  /** PUB: Phát sự kiện Redis */
  async publishEvent(channel: string, message: any): Promise<void> {
    await this.userRedisClient.publish(channel, JSON.stringify(message));
  }
  /** SUB: Đăng ký lắng nghe sự kiện Redis */
  async subscribeEvent(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    await this.userRedisClient.subscribe(channel);
    this.userRedisClient.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  //Set info
  async setKey(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.userRedisClient.set(key, value, 'EX', ttl);
    } else {
      await this.userRedisClient.set(key, value);
    }
  }
  async getKey(key: string): Promise<string | null> {
    return this.userRedisClient.get(key); // Lấy dữ liệu từ Redis
  }

  //Cập nhật trạng thái online-offline
  async setOnline(userId: string): Promise<void> {
    await this.userRedisClient.hset('users:online', userId, Date.now());
  }

  async delOnline(userId: string): Promise<void> {
    await this.userRedisClient.hdel('users:online', userId); // Xóa field khỏi hash
  }
}
