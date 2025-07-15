import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../user/strategies/jwt.strategy';
import { LocalStrategy } from '../user/strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // Cấu hình cơ bản, AuthService sẽ tự cấu hình khi sign token
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule, JwtStrategy, LocalStrategy], // Xuất ra để module khác có thể dùng
})
export class AuthModule {}
