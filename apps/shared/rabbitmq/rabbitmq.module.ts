import { DynamicModule, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitmqService } from './rabbitmq.service'

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE'

const rabbitMqUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.CLOUDAMQP_URL
    : process.env.RABBITMQ_URL

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
              urls: [`${rabbitMqUrl}`],
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
