import { Module } from '@nestjs/common';
import generateModulesSet from './utils/modules-set';

@Module({
  imports: generateModulesSet(),

  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
