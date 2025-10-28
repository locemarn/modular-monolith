import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '../../shared/auth/auth.module'
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
    RabbitmqModule.register('user_queue', 'USER_SERVICE'),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, JwtGrpcInterceptor],
})
export class ApiGatewayModule {}
