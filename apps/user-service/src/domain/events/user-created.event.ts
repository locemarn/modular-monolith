import { Logger } from '@nestjs/common'
import { DomainEvent } from '../../../../shared/events'

export type UserCreatedPayload = {
  id: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export class UserCreatedEvent extends DomainEvent {
  private readonly logger = new Logger(UserCreatedEvent.name)

  constructor(public readonly payload: UserCreatedPayload) {
    super(payload.id, 'UserCreatedEvent', payload.id)
    if (process.env.NODE_ENV !== 'test') {
      this.logger.log('UserCreatedEvent')
    }
  }

  getEventData(): Record<string, unknown> {
    return { ...this.payload }
  }
}
