import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PresenceModule } from './presence/presence.module';

@Module({
  imports: [AuthModule, PresenceModule],
})
export class ApiModule {}
