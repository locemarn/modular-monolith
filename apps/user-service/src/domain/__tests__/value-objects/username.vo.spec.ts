import { Username } from '../../value-objects'
import { InvalidUsernameException } from '../../exceptions'

describe('Username', () => {
  describe('create', () => {
    it('should create a Username instance with valid username', () => {
      const validUsername = 'validUser_123'
      const username = Username.create(validUsername)
      expect(username).toBeInstanceOf(Username)
      expect(username.toString()).toBe(validUsername)
    })

    it('should throw InvalidUsernameException if username is empty', () => {
      expect(() => Username.create('')).toThrow(InvalidUsernameException)
    })

    it('should throw InvalidUsernameException if username does not start with a letter', () => {
      expect(() => Username.create('1invalid')).toThrow(
        InvalidUsernameException,
      )
    })

    it('should throw InvalidUsernameException if username contains invalid characters', () => {
      expect(() => Username.create('invalid*user')).toThrow(
        InvalidUsernameException,
      )
    })

    it('should throw InvalidUsernameException if username is too short', () => {
      expect(() => Username.create('ab')).toThrow(InvalidUsernameException)
    })

    it('should throw InvalidUsernameException if username is too long', () => {
      expect(() => Username.create('a'.repeat(17))).toThrow(
        InvalidUsernameException,
      )
    })
  })

  describe('toString', () => {
    it('should return the original username string', () => {
      const usernameStr = 'UserExample'
      const username = Username.create(usernameStr)
      expect(username.toString()).toBe(usernameStr)
    })
  })
})
