import { Injectable, Logger, Optional } from '@nestjs/common'
import { DomainEvent } from './domain-event.base'
import { EventStore } from './entities/event-store.entity'
import { EventBus } from './event-bus.interface'
import { EventHandler } from './event-handler.interface'
import { TypeOrmEventStoreRepository } from './repositories/typeorm-event-store.repository'

@Injectable()
export class PersistentEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>()
  private readonly logger = new Logger(PersistentEventBus.name)

  constructor(
    @Optional()
    private readonly eventStoreRepository?: TypeOrmEventStoreRepository,
  ) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    this.logger.debug(`Publishing event: ${event.eventType}`, {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
    })

    if (this.eventStoreRepository) {
      try {
        const eventStore = new EventStore(
          event.eventId,
          event.eventType,
          event.aggregateId,
          event.aggregateType,
          event.getEventData(),
          event.occurredAt,
          event.eventVersion,
          event.userId,
        )

        await this.eventStoreRepository.save(eventStore)

        this.logger.debug(`Event persisted to store`, {
          eventId: event.eventId,
          eventType: event.eventType,
        })
      } catch (error) {
        const err = error as Error
        this.logger.error(`Failed to persist event to store`, {
          eventId: event.eventId,
          eventType: event.eventType,
          error: err.message,
          stack: err.stack,
        })
      }
    } else {
      this.logger.warn(
        'EventStoreRepository not available, skipping persistence',
      )
    }

    const eventHandlers = this.handlers.get(event.eventType)

    if (!eventHandlers || eventHandlers.size === 0) {
      this.logger.debug(
        `No handlers registered for event type: ${event.eventType}`,
      )
      return
    }

    const handlerPromises = Array.from(eventHandlers).map(async (handler) => {
      try {
        await handler.handle(event)
        this.logger.debug(`Event handler completed successfully`, {
          eventId: event.eventId,
          eventType: event.eventType,
          handlerName: handler.constructor.name,
        })
      } catch (error) {
        const err = error as Error
        this.logger.error(`Event handler failed`, {
          eventId: event.eventId,
          eventType: event.eventType,
          handlerName: handler.constructor.name,
          error: err.message,
          stack: err.stack,
        })
      }
    })

    await Promise.allSettled(handlerPromises)
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }

    const eventHandlers = this.handlers.get(eventType)
    if (!eventHandlers) {
      return
    }

    if (eventHandlers.has(handler)) {
      this.logger.warn(
        `Handler already registered for event type: ${eventType}`,
        {
          handlerName: handler.constructor.name,
        },
      )
      return
    }

    eventHandlers.add(handler)
    this.logger.debug(`Handler registered for event type: ${eventType}`, {
      handlerName: handler.constructor.name,
      totalHandlers: eventHandlers.size,
    })
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType)

    if (!eventHandlers) {
      this.logger.warn(`No handlers registered for event type: ${eventType}`)
      return
    }

    const removed = eventHandlers.delete(handler)

    if (removed) {
      this.logger.debug(`Handler unregistered for event type: ${eventType}`, {
        handlerName: handler.constructor.name,
        remainingHandlers: eventHandlers.size,
      })

      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType)
      }
    } else {
      this.logger.warn(`Handler not found for event type: ${eventType}`, {
        handlerName: handler.constructor.name,
      })
    }
  }

  getRegisteredHandlers(): Map<string, Set<EventHandler>> {
    return new Map(this.handlers)
  }

  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0
  }
}
