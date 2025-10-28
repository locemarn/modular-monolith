import { EventStore } from '../entities/event-store.entity'

export interface EventStoreRepository {
  save(eventStore: EventStore): Promise<EventStore>
  findByAggregateId(aggregateId: string): Promise<EventStore[]>
  findByEventType(eventType: string): Promise<EventStore[]>
  findByUserId(userId: string): Promise<EventStore[]>
  findByAggregateIdAndType(
    aggregateId: string,
    aggregateType: string,
  ): Promise<EventStore[]>
  findAll(limit?: number, offset?: number): Promise<EventStore[]>
  count(): Promise<number>
}
