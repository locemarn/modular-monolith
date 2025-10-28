import { DomainException } from './domain.exception'

export class InvalidPasswordException extends DomainException {
  constructor(password: string) {
    super(`Invalid password format: ${password}`)
  }
}
