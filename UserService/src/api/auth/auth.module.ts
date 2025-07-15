import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schema/user.schema';

import { LocalStrategy } from './strategies/local.strategy';
import { UserRedisService } from 'src/libs/redis/user-redis.service';
import { InternalJwtStrategy } from './strategies/internal-jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    LocalStrategy,
    InternalJwtStrategy,
    UserRedisService,
  ],
})
export class AuthModule {}
