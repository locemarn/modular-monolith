import { EventTestFactory } from '../../../../../shared/test-utils/factories/event-test.factory'
import { UserDeletedEvent } from '../../events/user-deleted.event'

describe('UserDeletedEvent', () => {
  it('should create an instance with payload', () => {
    const event = EventTestFactory.createUserDeletedEvent()

    expect(event).toBeInstanceOf(UserDeletedEvent)
    expect(event.payload).toBeDefined()
    expect(event.payload.id).toBe(EventTestFactory.DEFAULT_USER_ID)
    expect(event.payload.username).toBe(EventTestFactory.DEFAULT_USERNAME)
    expect(event.payload.email).toBe(EventTestFactory.DEFAULT_EMAIL)
    expect(event.payload.requestUserId).toBe(
      EventTestFactory.DEFAULT_REQUEST_USER_ID,
    )
  })

  it('should return correct event data from getEventData', () => {
    const event = EventTestFactory.createUserDeletedEvent()
    const eventData = event.getEventData()

    expect(eventData).toEqual(event.payload)
    expect(eventData.id).toBe(EventTestFactory.DEFAULT_USER_ID)
    expect(eventData.username).toBe(EventTestFactory.DEFAULT_USERNAME)
    expect(eventData.email).toBe(EventTestFactory.DEFAULT_EMAIL)
    expect(eventData.requestUserId).toBe(
      EventTestFactory.DEFAULT_REQUEST_USER_ID,
    )
  })

  it('should have correct event name', () => {
    const event = EventTestFactory.createUserDeletedEvent()
    expect(event.constructor.name).toBe('UserDeletedEvent')
  })

  it('should have correct aggregate id', () => {
    const event = EventTestFactory.createUserDeletedEvent()
    expect(event.aggregateId).toBe(event.payload.id)
  })

  it('should create event with custom data using overrides', () => {
    const customEvent = EventTestFactory.createUserDeletedEvent({
      id: 'custom-deleted-id-123',
      email: 'deleted@test.com',
      username: 'deleteduser',
      requestUserId: 'admin-user-456',
    })

    expect(customEvent.payload.id).toBe('custom-deleted-id-123')
    expect(customEvent.payload.email).toBe('deleted@test.com')
    expect(customEvent.payload.username).toBe('deleteduser')
    expect(customEvent.payload.requestUserId).toBe('admin-user-456')
    expect(customEvent.aggregateId).toBe('custom-deleted-id-123')
  })

  it('should handle undefined requestUserId', () => {
    const eventWithoutRequestUser = EventTestFactory.createUserDeletedEvent({
      requestUserId: undefined,
    })

    expect(eventWithoutRequestUser.payload.requestUserId).toBeUndefined()
  })

  it('should create event with helper method for custom data', () => {
    const event = EventTestFactory.createUserDeletedEventWithCustomData(
      'helper-deleted-id-789',
      'helper-deleted@test.com',
      'helperdeleted',
      'admin-789',
    )

    expect(event.payload.id).toBe('helper-deleted-id-789')
    expect(event.payload.email).toBe('helper-deleted@test.com')
    expect(event.payload.username).toBe('helperdeleted')
    expect(event.payload.requestUserId).toBe('admin-789')
  })

  it('should create event without request user using helper method', () => {
    const event = EventTestFactory.createUserDeletedEventWithoutRequestUser()

    expect(event.payload.requestUserId).toBeUndefined()
    expect(event.payload.id).toBe(EventTestFactory.DEFAULT_USER_ID)
    expect(event.payload.email).toBe(EventTestFactory.DEFAULT_EMAIL)
  })
})
