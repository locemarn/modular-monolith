import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from '../../shared/config/database.config'
import { AuthModule } from '../../shared/auth/auth.module'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { EventsModule } from '../../shared/events/events.module'
import { RabbitmqModule } from '../../shared/rabbitmq/rabbitmq.module'
import { UserServiceService } from './application/services/user-service.service'
import { UserRegisteredEventHandler } from './handlers/user-registered.eventhandler'
import { UserTypeOrmEntity } from './infrastructure/entities/user.typeorm-entity'
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository'
import { UserServiceController } from './presentation/controllers/user-service.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([UserTypeOrmEntity]),
    RabbitmqModule.register(
      RABBITMQ_CONSTANTS.QUEUES.USER_QUEUE,
      RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
    ),
    EventsModule,
  ],
  controllers: [UserServiceController],
  providers: [
    UserServiceService,
    UserRegisteredEventHandler,
    {
      provide: 'IUserRepositoryInterface',
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UserServiceModule {}
