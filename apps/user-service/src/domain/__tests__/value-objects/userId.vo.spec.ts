import { UserId } from '../../value-objects'

describe('UserId', () => {
  describe('generate', () => {
    it('should generate a valid UUID UserId', () => {
      const userId = UserId.generate()
      expect(userId).toBeInstanceOf(UserId)
      expect(userId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })
  })

  describe('create', () => {
    it('should create UserId from valid UUID string', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const userId = UserId.create(validUUID)
      expect(userId.value).toEqual(validUUID)
    })

    it('should throw error for invalid UUID string', () => {
      expect(() => {
        UserId.create('invalid-uuid')
      }).toThrow('UserId must be a valid UUID')
    })

    it('should throw error when called with empty string', () => {
      expect(() => {
        UserId.create('')
      }).toThrow('User id is required')
    })

    it('should throw error when called with non-string', () => {
      expect(() => {
        UserId.create(null as unknown as string)
      }).toThrow('User id is required')
    })
  })

  describe('equals', () => {
    it('should return true when two UserIds have the same value', () => {
      const idStr = '123e4567-e89b-12d3-a456-426614174000'
      const userId1 = UserId.create(idStr)
      const userId2 = UserId.create(idStr)
      expect(userId1.equals(userId2)).toBe(true)
    })

    it('should return false when two UserIds have different values', () => {
      const userId1 = UserId.create('123e4567-e89b-12d3-a456-426614174000')
      const userId2 = UserId.create('223e4567-e89b-12d3-a456-426614174000')
      expect(userId1.equals(userId2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the string value of the UserId', () => {
      const idStr = '123e4567-e89b-12d3-a456-426614174000'
      const userId = UserId.create(idStr)
      expect(userId.toString()).toBe(idStr)
    })
  })
})
