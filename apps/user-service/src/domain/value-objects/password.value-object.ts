import { InvalidPasswordException } from '../exceptions/invalid-password.exception'

export class Password {
  private constructor(
    private readonly value: string,
    private readonly isHashed: boolean = false,
  ) {}

  static create(
    plainPassword: string | undefined,
    hasher?: (password: string) => string,
  ): Password {
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new InvalidPasswordException('Password must be a non-empty string')
    }

    if (!Password.isValid(plainPassword)) {
      throw new InvalidPasswordException(
        Password.getValidationErrors(plainPassword) || 'Invalid password',
      )
    }

    const passwordValue = hasher ? hasher(plainPassword) : plainPassword
    const isHashed = !!hasher

    return new Password(passwordValue, isHashed)
  }

  static fromHash(hashedPassword: string | undefined): Password {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      throw new InvalidPasswordException(
        'Hashed password must be a non-empty string',
      )
    }

    return new Password(hashedPassword, true)
  }

  private static isValid(password: string): boolean {
    return Password.getValidationErrors(password) === null
  }

  private static getValidationErrors(password: string): string | null {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  get hash(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false
    }
    return this.value === other.value
  }

  verify(
    plainPassword: string,
    verifier?: (plain: string, hashed: string) => boolean,
  ): boolean {
    if (!this.isHashed) {
      throw new Error('Cannot verify against non-hashed password')
    }

    if (!verifier) {
      throw new Error(
        'Password verifier function is required for hashed passwords',
      )
    }

    return verifier(plainPassword, this.value)
  }
}
