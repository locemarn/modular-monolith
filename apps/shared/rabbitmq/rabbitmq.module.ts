import { DynamicModule, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitmqService } from './rabbitmq.service'

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE'

@Module({})
export class RabbitmqModule {
  static register(queueName: string, serviceName: string): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        ClientsModule.register([
          {
            name: serviceName,
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://rabbit_user:rabbit_password@localhost:5672'],
              queue: queueName,
              queueOptions: {
                durable: false,
              },
            },
          },
        ]),
      ],
      providers: [
        {
          provide: RABBITMQ_SERVICE,
          useClass: RabbitmqService,
        },
      ],
      exports: [RABBITMQ_SERVICE],
    }
  }
}
