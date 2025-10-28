import { IUserRepositoryInterface } from '../../../user-service/src/domain/repositories/user.repository.interface'
import { UserTestFactory } from '../factories/user-test.factory'

export const createMockUserRepository =
  (): jest.Mocked<IUserRepositoryInterface> => ({
    createUser: jest.fn().mockResolvedValue(UserTestFactory.createUserEntity()),
    getUserById: jest
      .fn()
      .mockResolvedValue(UserTestFactory.createUserEntity()),
    getUserByEmail: jest
      .fn()
      .mockResolvedValue(UserTestFactory.createUserEntity()),
    deleteUserById: jest
      .fn()
      .mockResolvedValue(UserTestFactory.createUserEntity()),
  })

export const mockUserRepositoryProvider = {
  provide: 'IUserRepositoryInterface',
  useFactory: createMockUserRepository,
}
