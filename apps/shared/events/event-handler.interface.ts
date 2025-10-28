import { DomainEvent } from './domain-event.base'

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): void
  getEventType(): string
}
