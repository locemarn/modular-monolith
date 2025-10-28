import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventStore } from '../entities/event-store.entity'
import type { EventStoreRepository } from './event-store.repository.interface'

@Injectable()
export class TypeOrmEventStoreRepository implements EventStoreRepository {
  constructor(
    @InjectRepository(EventStore)
    private readonly repository: Repository<EventStore>,
  ) {}

  async save(eventStore: EventStore): Promise<EventStore> {
    return await this.repository.save(eventStore)
  }

  async findByAggregateId(aggregateId: string): Promise<EventStore[]> {
    return await this.repository.find({
      where: { aggregateId },
      order: { createdAt: 'ASC' },
    })
  }

  async findByEventType(eventType: string): Promise<EventStore[]> {
    return await this.repository.find({
      where: { eventType },
      order: { createdAt: 'ASC' },
    })
  }

  async findByUserId(userId: string): Promise<EventStore[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    })
  }

  async findByAggregateIdAndType(
    aggregateId: string,
    aggregateType: string,
  ): Promise<EventStore[]> {
    return await this.repository.find({
      where: { aggregateId, aggregateType },
      order: { createdAt: 'ASC' },
    })
  }

  async findAll(limit = 100, offset = 0): Promise<EventStore[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })
  }

  async count(): Promise<number> {
    return await this.repository.count()
  }
}
