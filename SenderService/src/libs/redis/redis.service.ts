import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async setKey(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl); // Set với TTL
    } else {
      await this.redisClient.set(key, value); // Set không TTL
    }
  }
  async hsetKey(
    key: string,
    field: string,
    value: string,
    ttl?: number,
  ): Promise<void> {
    await this.redisClient.hset(key, field, value); // Lưu field vào hash

    if (ttl) {
      await this.redisClient.expire(key, ttl); // Đặt TTL nếu có
    }
  }

  async getKey(key: string): Promise<string | null> {
    return this.redisClient.get(key); // Lấy dữ liệu từ Redis
  }

  async deleteCache(key: string): Promise<void> {
    await this.redisClient.del(key); // Xóa dữ liệu từ Redis
  }
  async hdelKey(key: string, field: string): Promise<void> {
    await this.redisClient.hdel(key, field); // Xóa field khỏi hash
  }
}
