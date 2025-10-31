import { join } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { loadEnvironment } from '../../shared/config/env.config'
import { ApiGatewayModule } from './api-gateway.module'

loadEnvironment()

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051',
      package: 'api_gateway',
      protoPath: join(
        process.cwd(),
        'apps/api-gateway/proto/api-gateway.proto',
      ),
    },
  })

  await app.startAllMicroservices()
  await app.listen(process.env.port ?? 3000)
}
bootstrap().catch((err) => console.error(err))
