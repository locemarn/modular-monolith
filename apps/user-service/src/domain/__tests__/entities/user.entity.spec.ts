import { UserTestFactory } from '../../../../../shared/test-utils/factories/user-test.factory'
import { UserEntity } from '../../entities/user.entity'

describe('UserEntity (Unit)', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      const user = UserEntity.createUser(UserTestFactory.createValidUserInput())

      expect(user).toBeInstanceOf(UserEntity)
      expect(user.email.toString()).toBe('test@example.com')
      expect(user.username.toString()).toBe('testuser')
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for different users', () => {
      const users = UserTestFactory.createMultipleUsers(2)
      const user1 = UserEntity.createUser(users[0])
      const user2 = UserEntity.createUser(users[1])

      expect(user1.id.value).not.toBe(user2.id.value)
    })

    it('should set createdAt and updatedAt to the same time', () => {
      const user = UserEntity.createUser(UserTestFactory.createValidUserInput())

      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime())
    })
  })

  describe('fromPersistence', () => {
    it('should reconstruct user from persistence data', () => {
      const persistenceData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        username: 'testuser',
        password: '$2b$10$hashedpassword',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      const user = UserEntity.fromPersistence(persistenceData)

      expect(user.id.value).toBe(persistenceData.id)
      expect(user.email.toString()).toBe(persistenceData.email)
      expect(user.username.toString()).toBe(persistenceData.username)
      expect(user.createdAt).toEqual(persistenceData.createdAt)
      expect(user.updatedAt).toEqual(persistenceData.updatedAt)
    })
  })

  describe('toPersistence', () => {
    it('should convert user to persistence format', () => {
      const user = UserEntity.createUser(UserTestFactory.createValidUserInput())

      const persistence = user.toPersistence()

      expect(persistence).toHaveProperty('id')
      expect(persistence).toHaveProperty('email')
      expect(persistence).toHaveProperty('username')
      expect(persistence).toHaveProperty('password')
      expect(persistence).toHaveProperty('createdAt')
      expect(persistence).toHaveProperty('updatedAt')
      expect(typeof persistence.id).toBe('string')
      expect(typeof persistence.email).toBe('string')
    })
  })
})
