import { EventBus } from '../../events'

export const createMockEventBus = (): jest.Mocked<EventBus> => ({
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
})

export const mockEventBusProvider = {
  provide: 'EventBus',
  useFactory: createMockEventBus,
}
