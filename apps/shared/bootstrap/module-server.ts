import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ModuleConfig } from '../config/module.interfaces'

export class ModuleServer {
  private readonly logger = new Logger(ModuleServer.name)

  constructor(private config: ModuleConfig) {}

  async start(moduleClass: object): Promise<void> {
    const app = await NestFactory.create(moduleClass, {
      logger: ['error', 'warn', 'debug', 'log'],
    })

    const configService = app.get(ConfigService)

    const validationPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    })
    app.useGlobalPipes(validationPipe)

    if (this.config.rabbitmq) {
      const rabbitMqUrl =
        configService.get('RABBITMQ_URL') ||
        'amqp://rabbit_user:rabbit_password@localhost:5672'

      const microservice = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
          urls: [rabbitMqUrl],
          queue: this.config.rabbitmq.queue,
          queueOptions: {
            durable: this.config.rabbitmq.queueOptions?.durable || false,
          },
        },
      })

      microservice.useGlobalPipes(validationPipe)
      await app.startAllMicroservices()
    }

    if (this.config.grpc) {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
          url: this.config.grpc.url,
          package: this.config.grpc.package,
          protoPath: this.config.grpc.protoPath,
        },
      })

      await app.startAllMicroservices()
    }

    await app.listen(this.config.port)
    this.logger.log(
      `🚀 ${this.config.name} is running on http://localhost:${this.config.port}`,
    )
  }

  stop(): void {
    this.logger.log(`Stopping ${this.config.name}...`)
  }
}
