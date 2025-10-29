import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import {
  GRPCModuleConfig,
  JWTModuleConfig,
  RabbitMQModuleConfig,
} from './module.interfaces'

export interface BaseModuleConfig {
  name: string
  port: number
  environment: string
  database?: TypeOrmModuleOptions
  rabbitmq?: RabbitMQModuleConfig
  grpc?: GRPCModuleConfig
  jwt?: JWTModuleConfig
}
