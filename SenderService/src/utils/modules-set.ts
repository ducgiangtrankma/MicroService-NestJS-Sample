//Khai các setup các module
import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { ApiModule } from 'src/api/api.module';
import { AppConfig } from 'src/config/app-config.type';
import appConfig from 'src/config/app.config';
import { AllConfigType } from 'src/config/config.type';
import { DatabaseConfig } from 'src/database/config/database-config.type';
import databaseConfig from 'src/database/config/database.config';
import s3Config from 'src/libs/aws/config/s3.config';
import { LibsModule } from 'src/libs/libs.module';
import rabbitmqConfig from 'src/libs/rabbitmq/config/rabbitmq.config';
import redisConfig from 'src/libs/redis/config/redis.config';

export default function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
    ConfigModule.forRoot({
      isGlobal: true, // Đảm bảo ConfigModule hoạt động toàn cục
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [appConfig, databaseConfig, redisConfig, rabbitmqConfig, s3Config], // Load file config nếu cần
    }),
  ];

  const i18nModule = I18nModule.forRootAsync({
    useFactory: (configService: ConfigService<AllConfigType>) => ({
      fallbackLanguage: configService.get<AppConfig>('app').fallbackLanguage,
      loaderOptions: {
        path: join(__dirname, '/../i18n/'),
        watch: true,
      },
    }),
    resolvers: [
      { use: QueryResolver, options: ['lang'] }, // lấy language từ query param - Độ ưu tiên cao nhất
      AcceptLanguageResolver, // lấy language từ header mặc định của trình duyệt - Độ ưu tiên thứ 2
      new HeaderResolver(['x-lang']), // lấy language từ header  custom x-lang - Độ ưu tiên thứ 3
      //Nếu truyền cả 3 sẽ ưu tiên theo thứ tự còn truyền loại thì sẽ ưu tiên loại được truyền
    ],
    inject: [ConfigService],
  });

  const mongodbModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService<AllConfigType>) => ({
      uri: configService.get<DatabaseConfig>('database').urlConnection,
    }),
    inject: [ConfigService],
  });

  const customModules = [ApiModule, LibsModule, i18nModule, mongodbModule];
  return imports.concat(customModules);
}
