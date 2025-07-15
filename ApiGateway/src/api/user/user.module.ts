import { Module } from '@nestjs/common';
import { LibsModule } from 'src/libs/libs.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [LibsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export để module khác có thể dùng
})
export class UserModule {}
