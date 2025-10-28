import { DomainException } from './domain.exception'

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Invalid email format: ${email}`)
  }
}
