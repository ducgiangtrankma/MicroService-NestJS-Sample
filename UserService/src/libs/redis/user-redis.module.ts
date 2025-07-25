import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { RedisConfig } from './config/redis-config.type';

@Global()
@Module({
  providers: [
    {
      provide: 'USER_REDIS',
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return new Redis({
          host: configService.get<RedisConfig>('redis').host,
          port: configService.get<RedisConfig>('redis').port,
          password:
            configService.get<RedisConfig>('redis').password || undefined,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['USER_REDIS'],
})
export class UserRedisModule {}
