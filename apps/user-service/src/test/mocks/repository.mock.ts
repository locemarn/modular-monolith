import { UserEntity } from '../../domain/entities/user.entity'
import { IUserRepositoryInterface } from '../../domain/repositories/user.repository.interface'
import { EmailValueObject } from '../../domain/value-objects'

export const createMockRepository =
  (): jest.Mocked<IUserRepositoryInterface> => {
    return {
      createUser: jest.fn<Promise<UserEntity>, [UserEntity]>(),
      getUserById: jest.fn<Promise<UserEntity | null>, [string]>(),
      getUserByEmail: jest.fn<Promise<UserEntity | null>, [EmailValueObject]>(),
      deleteUserById: jest.fn<Promise<UserEntity | null>, [string]>(),
    }
  }
