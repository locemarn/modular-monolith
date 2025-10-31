import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { loadEnvironment } from '../../shared/config/env.config'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { AllExceptionsFilter } from './presentation/filters/rpc-exception.filter'
import { UserServiceModule } from './user-service.module'

loadEnvironment()

async function bootstrap() {
  const logger = new Logger()

  const app = await NestFactory.create(UserServiceModule, {
    logger: ['error', 'warn', 'debug', 'log'],
  })

  const configService = app.get(ConfigService)
  const nodeEnv = configService.get('NODE_ENV')

  const rabbitMqUrl =
    nodeEnv === 'production'
      ? configService.get('CLOUDAMQP_URL')
      : configService.get('RABBITMQ_URL')

  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
  })

  const exceptionFilter = new AllExceptionsFilter()

  app.useGlobalPipes(validationPipe)
  app.useGlobalFilters(exceptionFilter)

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: RABBITMQ_CONSTANTS.QUEUES.USER_QUEUE,
      queueOptions: {
        durable: nodeEnv === 'production',
        autoDelete: false,
      },
    },
  })

  microservice.useGlobalPipes(validationPipe)
  microservice.useGlobalFilters(exceptionFilter)

  const port = process.env.port ?? 3001
  await app.startAllMicroservices()
  await app.listen(port)
  logger.log(`🚀 User Service API is running on http://localhost:${port}`)
}

bootstrap().catch((error) => {
  Logger.error(
    '❌ Failed to start user service the application',
    error,
    'Bootstrap',
  )
  process.exit(1)
})
