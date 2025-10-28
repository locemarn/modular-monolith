import { Logger } from '@nestjs/common'
import { EventHandler, UserCreatedEvent } from '../../../shared/events'

export class UserRegisteredEventHandler
  implements EventHandler<UserCreatedEvent>
{
  private readonly logger = new Logger(UserRegisteredEventHandler.name)

  getEventType(): string {
    return 'UserRegisteredEvent'
  }

  handle(event: UserCreatedEvent): void {
    this.logger.debug('Handling UserRegisteredEvent', {
      eventId: event.eventId,
      userId: event.payload.id,
      email: event.payload.email,
    })

    try {
      this.logger.log('Welcome email notification sent successfully', {
        eventId: event.eventId,
        userId: event.payload.id,
        email: event.payload.email,
      })
    } catch (error) {
      const err = error as Error
      this.logger.error('Failed to send welcome email notification', {
        eventId: event.eventId,
        userId: event.payload.id,
        email: event.payload.email,
        error: err.message,
        stack: err.stack,
      })

      throw error
    }
  }
}
