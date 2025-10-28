export interface LegacyDomainEvent<TPayload = unknown> {
  readonly eventType: string
  readonly aggregateId?: string
  readonly aggregateType?: string
  readonly occurredAt: Date
  readonly version?: number
  readonly payload: TPayload
}

export { DomainEvent } from './domain-event.base'
export { EventBus } from './event-bus.interface'
export { EventHandler } from './event-handler.interface'
export { InMemoryEventBus } from './in-memory-event-bus'
