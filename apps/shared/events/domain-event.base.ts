import { randomUUID } from 'node:crypto'

export abstract class DomainEvent {
  public readonly eventId: string
  public readonly eventType: string
  public readonly aggregateId: string
  public readonly aggregateType: string
  public readonly occurredAt: Date
  public readonly eventVersion: number
  public readonly userId?: string

  constructor(
    aggregateId: string,
    aggregateType: string,
    userId?: string,
    eventVersion: number = 1,
  ) {
    this.eventId = randomUUID()
    this.eventType = this.constructor.name
    this.aggregateId = aggregateId
    this.aggregateType = aggregateType
    this.occurredAt = new Date()
    this.eventVersion = eventVersion
    this.userId = userId
  }

  abstract getEventData(): Record<string, unknown>

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      occurredAt: this.occurredAt.toISOString(),
      eventVersion: this.eventVersion,
      userId: this.userId,
      eventData: this.getEventData(),
    }
  }
}
