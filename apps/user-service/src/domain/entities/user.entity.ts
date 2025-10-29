import { EmailValueObject, Password, UserId, Username } from '../value-objects'
import {
  CreateUserData,
  UserPersistenceData,
} from './interfaces/user.interface'

export class UserEntity {
  private constructor(
    private readonly _id: UserId,
    private readonly _username: Username,
    private readonly _email: EmailValueObject,
    private readonly _password: Password,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static createUser(
    data: CreateUserData,
    passwordHasher?: (password: string) => string,
  ): UserEntity {
    const id = UserId.generate()
    const email = EmailValueObject.create(data.email)
    const password = Password.create(data.password, passwordHasher)
    const username = Username.create(data.username)
    const now = new Date()

    return new UserEntity(id, username, email, password, now, now)
  }

  get id(): UserId {
    return this._id
  }

  get username(): Username {
    return this._username
  }

  get email(): EmailValueObject {
    return this._email
  }

  get password(): Password {
    return this._password
  }

  get createdAt(): Date {
    return new Date(this._createdAt)
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt)
  }

  toPersistence(): UserPersistenceData {
    return {
      id: this._id.value,
      username: this._username.toString(),
      email: this._email.toString(),
      password: this._password.toString(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }

  static fromPersistence(data: UserPersistenceData): UserEntity {
    const id = UserId.create(data.id)
    const username = Username.create(data.username)
    const email = EmailValueObject.create(data.email)
    const password = Password.fromHash(data.password)

    return new UserEntity(
      id,
      username,
      email,
      password,
      data.createdAt,
      data.updatedAt,
    )
  }
}

