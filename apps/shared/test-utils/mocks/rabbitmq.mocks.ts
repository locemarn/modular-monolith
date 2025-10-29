import { of } from 'rxjs'
import { RabbitmqService } from '../../rabbitmq/rabbitmq.service'

export const createMockRabbitmqService = (): jest.Mocked<RabbitmqService> =>
  ({
    sendMessage: jest.fn().mockReturnValue(of({})),
    emitMessage: jest.fn().mockReturnValue(of(undefined)),
    getClient: jest.fn(),
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    initializeClients: jest.fn(),
  }) as unknown as jest.Mocked<RabbitmqService>

export const mockRabbitmqServiceProvider = {
  provide: 'RABBITMQ_SERVICE',
  useFactory: createMockRabbitmqService,
}
