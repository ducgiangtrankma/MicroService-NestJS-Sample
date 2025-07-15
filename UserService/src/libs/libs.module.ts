import { Module } from '@nestjs/common';
import { UserRedisModule } from './redis/user-redis.module';

@Module({
  imports: [UserRedisModule],
})
export class LibsModule {}
