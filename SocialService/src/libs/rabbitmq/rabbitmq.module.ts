import { Module } from '@nestjs/common';
import {
  ClientsModule,
  Transport,
  ClientProvider,
} from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_QUEUE',
        imports: [ConfigModule],
        useFactory: async (
          configService: ConfigService<AllConfigType>,
        ): Promise<ClientProvider> =>
          ({
            transport: Transport.RMQ,
            options: {
              urls: [configService.getOrThrow('rabbitmq.url', { infer: true })],
              queue: configService.getOrThrow('rabbitmq.queueName', {
                infer: true,
              }),
              queueOptions: {
                durable: true,
              },
            },
          }) as ClientProvider, // Ép kiểu về ClientProvider
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
/**
 * http://14.225.253.128:15672/#/queues
 *
 */
