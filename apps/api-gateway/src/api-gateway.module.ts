import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '../../shared/auth/auth.module'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { RabbitmqModule } from '../../shared/rabbitmq/rabbitmq.module'
import { ApiGatewayController } from './api-gateway.controller'
import { ApiGatewayService } from './api-gateway.service'
import { JwtGrpcInterceptor } from './infrastructure/interceptors/jwt-grpc.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RabbitmqModule.register(
      RABBITMQ_CONSTANTS.QUEUES.USER_QUEUE,
      RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
    ),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, JwtGrpcInterceptor],
})
export class ApiGatewayModule {}
