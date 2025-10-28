import { EventTestFactory } from '../../../../../shared/test-utils/factories/event-test.factory'
import { UserCreatedEvent } from '../../events'

describe('UserCreatedEvent', () => {
  it('should create an instance with payload', () => {
    const event = EventTestFactory.createUserCreatedEvent()

    expect(event).toBeInstanceOf(UserCreatedEvent)
    expect(event.payload).toBeDefined()
    expect(event.payload.id).toBe(EventTestFactory.DEFAULT_USER_ID)
    expect(event.payload.username).toBe(EventTestFactory.DEFAULT_USERNAME)
    expect(event.payload.email).toBe(EventTestFactory.DEFAULT_EMAIL)
  })

  it('should return correct event data from getEventData', () => {
    const event = EventTestFactory.createUserCreatedEvent()
    const eventData = event.getEventData()

    expect(eventData).toEqual(event.payload)
    expect(eventData.id).toBe(EventTestFactory.DEFAULT_USER_ID)
    expect(eventData.username).toBe(EventTestFactory.DEFAULT_USERNAME)
    expect(eventData.email).toBe(EventTestFactory.DEFAULT_EMAIL)
  })

  it('should have correct event name', () => {
    const event = EventTestFactory.createUserCreatedEvent()
    expect(event.constructor.name).toBe('UserCreatedEvent')
  })

  it('should have correct aggregate id', () => {
    const event = EventTestFactory.createUserCreatedEvent()
    expect(event.aggregateId).toBe(event.payload.id)
  })

  it('should create multiple events with different data', () => {
    const events = EventTestFactory.createMultipleUserCreatedEvents(3)

    expect(events).toHaveLength(3)
    events.forEach((event, index) => {
      expect(event).toBeInstanceOf(UserCreatedEvent)
      expect(event.payload.email).toBe(`user${index}@example.com`)
      expect(event.payload.username).toBe(`user${index}`)
    })
  })

  it('should create event with custom data using overrides', () => {
    const customEvent = EventTestFactory.createUserCreatedEvent({
      id: 'custom-id-123',
      email: 'custom@test.com',
      username: 'customuser',
    })

    expect(customEvent.payload.id).toBe('custom-id-123')
    expect(customEvent.payload.email).toBe('custom@test.com')
    expect(customEvent.payload.username).toBe('customuser')
    expect(customEvent.aggregateId).toBe('custom-id-123')
  })

  it('should create event with helper method', () => {
    const event = EventTestFactory.createUserCreatedEventWithCustomData(
      'helper-id-456',
      'helper@test.com',
      'helperuser',
    )

    expect(event.payload.id).toBe('helper-id-456')
    expect(event.payload.email).toBe('helper@test.com')
    expect(event.payload.username).toBe('helperuser')
  })

  it('should use default payload values consistently', () => {
    const event = EventTestFactory.createUserCreatedEvent()
    const defaultPayload = EventTestFactory.getDefaultUserPayload()

    expect(event.payload.id).toBe(defaultPayload.id)
    expect(event.payload.email).toBe(defaultPayload.email)
    expect(event.payload.username).toBe(defaultPayload.username)
    expect(event.payload.createdAt).toEqual(defaultPayload.createdAt)
    expect(event.payload.updatedAt).toEqual(defaultPayload.updatedAt)
  })
})
