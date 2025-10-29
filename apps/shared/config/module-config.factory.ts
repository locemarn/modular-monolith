import { ModuleConfig } from "./module.interfaces";

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
