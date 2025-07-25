import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import * as compression from 'compression';
import helmet from 'helmet';
import { I18nService } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { ValidationException } from './exceptions/validation.exception';
import { GlobalExceptionFilter } from './filters/global-exception-filter';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Setup security headers
  app.use(helmet());
  // For high-traffic websites in production, it is strongly recommended to offload compression from the application server - typically in a reverse proxy (e.g., Nginx). In that case, you should not use compression middleware.
  app.use(compression());

  const configService = app.get(ConfigService<AllConfigType>);

  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  console.info('CORS Origin:', corsOrigin);

  const i18nService = app.get(I18nService) as I18nService;

  const port = configService.getOrThrow('app.port', {
    infer: true,
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Boilerplate Docs')
    .setDescription('API documentation for ducgiangtran.dev')
    .setVersion('1.0')
    .addBearerAuth() // Thêm hỗ trợ auth nếu cần
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Đường dẫn Swagger docs

  // Cấu hình microservice với options đầy đủ để tránh lỗi 406
  const notificationService = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow('rabbitmq.url', { infer: true })],
      queue: configService.getOrThrow('rabbitmq.queueName', { infer: true }),
      queueOptions: {
        durable: true,
        exclusive: false,
        autoDelete: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
      noAck: false, // Sử dụng manual acknowledgment
    },
  });

  app.useGlobalFilters(new GlobalExceptionFilter(configService, i18nService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // 422
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(errors);
      },
    }),
  );

  await notificationService.listen();
  await app.listen(port);

  console.info(`Server running on ${await app.getUrl()}`);
  return app;
}
bootstrap();
