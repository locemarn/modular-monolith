import {
  UserCreatedEvent,
  UserCreatedPayload,
} from '../../../user-service/src/domain/events'
import {
  UserDeletedEvent,
  UserDeletedPayload,
} from '../../../user-service/src/domain/events/user-deleted.event'

export class EventTestFactory {
  static readonly DEFAULT_USER_ID = '123e4567-e89b-12d3-a456-426614174000'
  static readonly DEFAULT_EMAIL = 'test@example.com'
  static readonly DEFAULT_USERNAME = 'testuser'
  static readonly DEFAULT_REQUEST_USER_ID =
    '123e4567-e89b-12d3-a456-426614174000'
  static readonly DEFAULT_DATE = new Date('2024-01-01T00:00:00Z')
  static createUserCreatedEvent(
    overrides?: Partial<UserCreatedPayload>,
  ): UserCreatedEvent {
    const defaultPayload: UserCreatedPayload = {
      id: this.DEFAULT_USER_ID,
      email: this.DEFAULT_EMAIL,
      username: this.DEFAULT_USERNAME,
      createdAt: this.DEFAULT_DATE,
      updatedAt: this.DEFAULT_DATE,
    }

    return new UserCreatedEvent({
      ...defaultPayload,
      ...overrides,
    })
  }

  static createUserDeletedEvent(
    overrides?: Partial<UserDeletedPayload>,
  ): UserDeletedEvent {
    const defaultPayload: UserDeletedPayload = {
      id: this.DEFAULT_USER_ID,
      email: this.DEFAULT_EMAIL,
      username: this.DEFAULT_USERNAME,
      createdAt: this.DEFAULT_DATE,
      updatedAt: this.DEFAULT_DATE,
      requestUserId: this.DEFAULT_REQUEST_USER_ID,
    }

    return new UserDeletedEvent({
      ...defaultPayload,
      ...overrides,
    })
  }

  static createMultipleUserCreatedEvents(count: number): UserCreatedEvent[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUserCreatedEvent({
        id: `123e4567-e89b-12d3-a456-42661417400${index}`,
        email: `user${index}@example.com`,
        username: `user${index}`,
      }),
    )
  }

  static createUserCreatedEventWithCustomData(
    id: string,
    email: string,
    username: string,
  ): UserCreatedEvent {
    return this.createUserCreatedEvent({ id, email, username })
  }

  static createUserDeletedEventWithCustomData(
    id: string,
    email: string,
    username: string,
    requestUserId?: string,
  ): UserDeletedEvent {
    return this.createUserDeletedEvent({ id, email, username, requestUserId })
  }

  static createUserDeletedEventWithoutRequestUser(): UserDeletedEvent {
    return this.createUserDeletedEvent({ requestUserId: undefined })
  }

  static getDefaultUserPayload() {
    return {
      id: this.DEFAULT_USER_ID,
      email: this.DEFAULT_EMAIL,
      username: this.DEFAULT_USERNAME,
      createdAt: this.DEFAULT_DATE,
      updatedAt: this.DEFAULT_DATE,
    }
  }
}
