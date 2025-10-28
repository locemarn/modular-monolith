import { InvalidEmailException } from '../exceptions'

export class EmailValueObject {
  private constructor(private readonly value: string) {}

  static create(email: string): EmailValueObject {
    if (!email || typeof email !== 'string') {
      throw new InvalidEmailException(email)
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!EmailValueObject.isValid(normalizedEmail)) {
      throw new InvalidEmailException(email)
    }
    return new EmailValueObject(normalizedEmail)
  }

  private static isValid(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (email.length > 254) return false
    if (email.startsWith('.') || email.endsWith('.')) return false
    if (email.includes('..')) return false

    return emailRegex.test(email)
  }

  toString(): string {
    return this.value
  }

  equals(other: EmailValueObject): boolean {
    if (!(other instanceof EmailValueObject)) {
      return false
    }
    return this.value === other.value
  }

  /**
   * Returns the domain part of the email
   * @returns The domain part (after @)
   */
  getDomain(): string {
    return this.value.split('@')[1]
  }

  /**
   * Returns the local part of the email
   * @returns The local part (before @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0]
  }
}
