import { CreateUserInput, LoginInput } from '../../../api-gateway/src/dtos'
import { UserResponseDto } from '../../../user-service/src/application/dtos'
import { UserEntity } from '../../../user-service/src/domain/entities/user.entity'

export class UserTestFactory {
  static createValidUserInput(): CreateUserInput {
    return {
      email: 'test@example.com',
      password: 'ValidPass123!',
      username: 'testuser',
    }
  }

  static createInvalidUserInput(): CreateUserInput {
    return {
      email: 'invalid-email',
      password: 'ab',
      username: '123',
    }
  }

  static createLoginInput(): LoginInput {
    return {
      email: 'test@example.com',
      password: 'ValidPass123!',
    }
  }

  static createUserEntity(): UserEntity {
    return UserEntity.createUser(this.createValidUserInput())
  }

  static createUserEntityWithHashedPassword(): UserEntity {
    return UserEntity.createUser(
      this.createValidUserInput(),
      (password) => 'hashedPassword123',
    )
  }

  static createUserResponse(): UserResponseDto {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  }

  static createMultipleUsers(count: number): CreateUserInput[] {
    return Array.from({ length: count }, (_, index) => ({
      email: `user${index}@example.com`,
      password: 'ValidPass123!',
      username: `user${index}`,
    }))
  }
}
