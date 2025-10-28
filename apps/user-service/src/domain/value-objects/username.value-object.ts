import { InvalidUsernameException } from '../exceptions'

export class Username {
  private constructor(private readonly _value: string) {}

  static create(value: string): Username {
    if (!value) throw new InvalidUsernameException('Username is required')
    const normalizedValue = value.toLowerCase().trim()
    const isValidUsername = Username.isValid(normalizedValue)
    if (!isValidUsername) throw new InvalidUsernameException(value)
    return new Username(value)
  }

  private static isValid(username: string): boolean {
    return Username.getValidationErrors(username) === null
  }

  /**
   * Explicação da regex:
   * ^ indica o início da string.
   * [a-zA-Z] exige que o primeiro caractere seja uma letra.
   * [a-zA-Z0-9_] permite letras, números e underscore para os caracteres seguintes.
   * {2,15} exige que haja de 2 a 15 desses caracteres, garantindo um username total de 3 a 16 caracteres.
   * $ indica o fim da string.
   * @param username
   * @private
   */
  private static getValidationErrors(username: string): string | null {
    if (
      !/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/.test(username) ||
      username.length < 3 ||
      username.length > 16 ||
      !username
    ) {
      throw new InvalidUsernameException(username)
    }
    return null
  }

  toString(): string {
    return this._value
  }
}
