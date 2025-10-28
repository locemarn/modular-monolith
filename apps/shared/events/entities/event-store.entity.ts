import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('event_store')
@Index(['aggregateId', 'aggregateType'])
@Index(['eventType'])
@Index(['userId'])
@Index(['createdAt'])
export class EventStore {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_type', type: 'varchar', length: 255 })
  eventType: string

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId: string

  @Column({ name: 'aggregate_type', type: 'varchar', length: 100 })
  aggregateType: string

  @Column({
    name: 'event_data',
    type: 'text',
    transformer: {
      to: (value: Record<string, unknown>) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  eventData: Record<string, unknown>

  @Column({ name: 'event_version', type: 'integer', default: 1 })
  eventVersion: number

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string

  @Column({ name: 'event_id', type: 'uuid', unique: true })
  eventId: string

  @Column({ name: 'occurred_at' })
  occurredAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  constructor(
    eventId: string,
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    eventData: Record<string, unknown>,
    occurredAt: Date,
    eventVersion: number = 1,
    userId?: string,
  ) {
    this.eventId = eventId
    this.eventType = eventType
    this.aggregateId = aggregateId
    this.aggregateType = aggregateType
    this.eventData = eventData
    this.occurredAt = occurredAt
    this.eventVersion = eventVersion
    this.userId = userId
  }
}
