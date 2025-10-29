import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface ModuleConfig {
  name: string;
  port: number;
  environment: string;
  database?: TypeOrmModuleOptions;
  rabbitmq?: RabbitMQModuleConfig;
  grpc?: GRPCModuleConfig;
  jwt?: JWTModuleConfig;
}

export interface RabbitMQModuleConfig {
  queue: string;
  queueOptions?: {
    durable: boolean;
  };
}

export interface GRPCModuleConfig {
  url: string;
  package: string;
  protoPath: string;
}

export interface JWTModuleConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
}

export interface ModuleMetadata {
  name: string;
  version: string;
  port: number;
  hasGrpc: boolean;
  hasRabbitMQ: boolean;
  hasDatabase: boolean;
  dependencies: string[];
  sharedDependencies: string[];
  buildTarget: string;
}

export class ModuleConfigFactory {
  static createApiGatewayConfig(): ModuleConfig {
    return {
      name: 'api-gateway',
      port: parseInt(process.env.API_GATEWAY_PORT || '3000'),
      environment: process.env.NODE_ENV || 'development',
      grpc: {
        url: '0.0.0.0:50051',
        package: 'api_gateway',
        protoPath: 'apps/api-gateway/proto/api-gateway.proto',
      },
    };
  }

  static createUserServiceConfig(): ModuleConfig {
    return {
      name: 'user-service',
      port: parseInt(process.env.USER_SERVICE_PORT || '3001'),
      environment: process.env.NODE_ENV || 'development',
      rabbitmq: {
        queue: 'user_queue',
        queueOptions: {
          durable: false,
        },
      },
    };
  }
}
