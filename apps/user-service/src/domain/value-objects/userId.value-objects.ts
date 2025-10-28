import { randomUUID } from 'node:crypto'

export class UserId {
  private constructor(private readonly _value: string) {}

  static generate(): UserId {
    return new UserId(randomUUID())
  }

  static create(value: string): UserId {
    if (!value || typeof value !== 'string')
      throw new Error('User id is required')

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      throw new Error('UserId must be a valid UUID')
    }
    return new UserId(value)
  }

  get value(): string {
    return this._value
  }

  equals(other: UserId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
