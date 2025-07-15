//Khai các setup các module
import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

import { LibsModule } from 'src/libs/libs.module';

export default function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
    ConfigModule.forRoot({
      isGlobal: true, // Đảm bảo ConfigModule hoạt động toàn cục
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [appConfig], // Load file config nếu cần
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

  const customModules = [ApiModule, LibsModule, i18nModule];
  return imports.concat(customModules);
}
