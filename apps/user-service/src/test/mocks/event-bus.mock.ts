import { DomainEvent, EventBus } from '../../../../shared/events'

export const createMockEventBus = (): jest.Mocked<EventBus> => {
  return {
    publish: jest.fn<Promise<void>, [DomainEvent]>(),
    subscribe: jest.fn<void, [string, unknown]>(),
    unsubscribe: jest.fn<void, [string]>(),
  } as unknown as jest.Mocked<EventBus>
}
