import { Module } from '@nestjs/common';
import { AuthModule } from 'src/api/auth/auth.module';
import { InterServiceClient } from './inter-service-client';

@Module({
  imports: [AuthModule],
  providers: [InterServiceClient],
  exports: [InterServiceClient],
})
export class LibsModule {}
