import { EmailValueObject } from '../../value-objects'

describe('EmailValueObject (Unit)', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = EmailValueObject.create('test@example.com')
      expect(email.toString()).toBe('test@example.com')
    })

    it('should convert email to lowercase', () => {
      const email = EmailValueObject.create('TEST@EXAMPLE.COM')
      expect(email.toString()).toBe('test@example.com')
    })

    it('should throw error for invalid email format', () => {
      expect(() => EmailValueObject.create('invalid-email')).toThrow()
    })

    it('should throw error for empty email', () => {
      expect(() => EmailValueObject.create('')).toThrow()
    })

    it('should throw error for email without @', () => {
      expect(() => EmailValueObject.create('testexample.com')).toThrow()
    })
  })

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = EmailValueObject.create('test@example.com')
      const email2 = EmailValueObject.create('test@example.com')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return false for different emails', () => {
      const email1 = EmailValueObject.create('test1@example.com')
      const email2 = EmailValueObject.create('test2@example.com')
      expect(email1.equals(email2)).toBe(false)
    })
  })
})
