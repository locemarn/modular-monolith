import { Password } from '../../value-objects'

describe('Password Value Object (Unit)', () => {
  describe('create', () => {
    it('should create password with valid plain text', () => {
      const password = Password.create('ValidPass123!')
      expect(password.toString()).toBe('ValidPass123!')
    })

    it('should throw error for password less than 8 characters', () => {
      expect(() => Password.create('Short1!')).toThrow(
        'Password must be at least 8 characters long',
      )
    })

    it('should throw error for password without uppercase', () => {
      expect(() => Password.create('noupperca$e1')).toThrow('uppercase')
    })

    it('should throw error for password without lowercase', () => {
      expect(() => Password.create('NOLOWERCASE1!')).toThrow('lowercase')
    })

    it('should throw error for password without number', () => {
      expect(() => Password.create('NoNumber!!')).toThrow('number')
    })

    it('should throw error for password without special character', () => {
      expect(() => Password.create('NoSpecial123')).toThrow('special character')
    })
  })

  describe('fromHash', () => {
    it('should create password from hash', () => {
      const hash = '$2b$10$somehashedpassword'
      const password = Password.fromHash(hash)
      expect(password.toString()).toBe(hash)
    })

    it('should throw error for empty hash', () => {
      expect(() => Password.fromHash('')).toThrow()
    })
  })
})
