import { Injectable } from '@nestjs/common'
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { Observable } from 'rxjs'
import { IRabbitMQInterface } from '../interfaces/rabbitmq.interface'

@Injectable()
export class RabbitmqService implements IRabbitMQInterface {
  private clients = new Map<string, ClientProxy>()

  initializeClients(
    configs: Array<{ serviceName: string; queueName: string }>,
  ) {
    configs.forEach(({ serviceName, queueName }) => {
      if (!this.clients.has(serviceName)) {
        const client = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://rabbit_user:rabbit_password@localhost:5672'],
            queue: queueName,
            queueOptions: {
              durable: false,
            },
          },
        })
        this.clients.set(serviceName, client)
      }
    })
  }

  async onModuleInit() {
    this.initializeClients([
      { serviceName: 'USER_SERVICE', queueName: 'user_queue' },
    ])

    const connectPromises = Array.from(this.clients.values()).map((client) =>
      client.connect().catch((err) => ({})),
    )

    await Promise.all(connectPromises)
  }

  getClient(serviceName: string): ClientProxy | undefined {
    return this.clients.get(serviceName)
  }

  sendMessage<ResponseType, PayloadType>(
    serviceName: string,
    pattern: string,
    data: PayloadType,
    metadata?: Record<string, unknown>,
  ): Observable<ResponseType> {
    const client = this.getClient(serviceName)
    if (!client) throw new Error(`Client for service ${serviceName} not found`)
    if (metadata) client.send<ResponseType>(pattern, { data, metadata })
    return client.send<ResponseType>(pattern, { data })
  }

  emitMessage<T>(
    serviceName: string,
    pattern: string,
    data: T,
    metadata?: Record<string, unknown>,
  ): Observable<void> {
    const client = this.getClient(serviceName)
    if (!client) throw new Error(`Client for service ${serviceName} not found`)
    return client.emit(pattern, { data, metadata })
  }
}
