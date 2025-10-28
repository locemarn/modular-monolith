import { UserEntity } from '../../domain/entities/user.entity'
import {
  EmailValueObject,
  Password,
  UserId,
  Username,
} from '../../domain/value-objects'

interface IUserPersistence {
  id: string
  email: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export const createMockUser = (
  overrides?: Partial<IUserPersistence>,
): UserEntity => {
  const id = UserId.create('123e4567-e89b-12d3-a456-426614174000')
  const email = EmailValueObject.create('test@example.com')
  const username = Username.create('testuser')
  const password = Password.fromHash('$2b$10$Hashedpassword')
  const now = new Date()

  return UserEntity.fromPersistence({
    id: id.value,
    email: email.toString(),
    username: username.toString(),
    password: password.toString(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  })
}

export const createMockUserResponse = () => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
})
