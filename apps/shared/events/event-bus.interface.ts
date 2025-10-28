import { DomainEvent } from './domain-event.base'
import { EventHandler } from './event-handler.interface'

export interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void
  unsubscribe(eventType: string, handler: EventHandler): void
}

export { EventHandler } from './event-handler.interface'
