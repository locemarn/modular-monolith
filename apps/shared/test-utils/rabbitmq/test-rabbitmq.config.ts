import { ClientsModuleOptions, Transport } from '@nestjs/microservices'
import { RABBITMQ_CONSTANTS } from '../../constants/rabbitmq'

export const testRabbitMQConfig: ClientsModuleOptions = [
  {
    name: 'USER_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.TEST_RABBITMQ_URL ||
          'amqp://test_user:test_password@localhost:5673',
      ],
      queue: RABBITMQ_CONSTANTS.QUEUES.USER_QUEUE,
      queueOptions: {
        durable: false,
        autoDelete: false,
      },
      noAck: false,
      prefetchCount: 1,
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  },
]

export const testRabbitMQMicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [
      process.env.TEST_RABBITMQ_URL ||
        'amqp://test_user:test_password@localhost:5673',
    ],
    queue: RABBITMQ_CONSTANTS.QUEUES.USER_QUEUE,
    queueOptions: {
      durable: false,
      autoDelete: false,
    },
    noAck: false,
    prefetchCount: 1,
    socketOptions: {
      heartbeatIntervalInSeconds: 60,
      reconnectTimeInSeconds: 5,
    },
  },
}
