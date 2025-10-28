import { Injectable, Logger } from '@nestjs/common'
import { DomainEvent } from '../../../../shared/events'

export type UserDeletedPayload = {
  id: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
  requestUserId?: string
}

@Injectable()
export class UserDeletedEvent extends DomainEvent {
  private readonly logger = new Logger(UserDeletedEvent.name)

  constructor(public readonly payload: UserDeletedPayload) {
    super(payload.id, 'UserDeletedEvent', payload.requestUserId)
    if (process.env.NODE_ENV !== 'test') {
      this.logger.log('UserDeletedEvent')
    }
  }

  getEventData(): Record<string, unknown> {
    return { ...this.payload }
  }
}
