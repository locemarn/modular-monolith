import { Test, TestingModule } from '@nestjs/testing'
import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import { UserServiceService } from '../../application/services/user-service.service'
import { UserServiceController } from './user-service.controller'

describe('UserServiceController (Integration)', () => {
  let controller: UserServiceController
  let service: UserServiceService

  beforeEach(async () => {
    const serviceMock = {
      getHello: jest.fn().mockReturnValue('Hello from service!'),
      createUserService: jest.fn(),
      login: jest.fn(),
      deleteUserById: jest.fn(),
      findUserById: jest.fn(),
      getUserByEmail: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceController],
      providers: [{ provide: UserServiceService, useValue: serviceMock }],
    }).compile()

    controller = module.get(UserServiceController)
    service = module.get(UserServiceService)
  })

  it('should return hello', () => {
    expect(controller.getHello()).toBe('Hello from service!')
    expect(service.getHello).toHaveBeenCalled()
  })

  it('should create user via message pattern', async () => {
    const dto = UserTestFactory.createValidUserInput()
    const userResponse = UserTestFactory.createUserResponse()
    service.createUserService = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.createUser({ data: dto })

    expect(service.createUserService).toHaveBeenCalledWith(dto)
    expect(result).toEqual(userResponse)
  })

  it('should login via message pattern', async () => {
    const dto = UserTestFactory.createLoginInput()
    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }
    service.login = jest.fn().mockResolvedValue(tokens)

    const result = await controller.login({ data: dto })

    expect(service.login).toHaveBeenCalledWith(dto)
    expect(result).toEqual(tokens)
  })

  it('should delete user with string payload', async () => {
    const userId = '123'
    const userResponse = UserTestFactory.createUserResponse()
    service.deleteUserById = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.deleteUser(userId)

    expect(service.deleteUserById).toHaveBeenCalledWith(userId, undefined)
    expect(result).toEqual(userResponse)
  })

  it('should delete user with payload object', async () => {
    const payload = { data: '123', metadata: { requestUserId: 'reqUserId' } }
    const userResponse = UserTestFactory.createUserResponse()
    service.deleteUserById = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.deleteUser(payload)

    expect(service.deleteUserById).toHaveBeenCalledWith('123', 'reqUserId')
    expect(result).toEqual(userResponse)
  })

  it('should find user by id with string payload', async () => {
    const userId = '456'
    const userResponse = UserTestFactory.createUserResponse()
    service.findUserById = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.findUserById(userId)

    expect(service.findUserById).toHaveBeenCalledWith(userId)
    expect(result).toEqual(userResponse)
  })

  it('should find user by id with object payload', async () => {
    const payload = { data: '456', metadata: {} }
    const userResponse = UserTestFactory.createUserResponse()
    service.findUserById = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.findUserById(payload)

    expect(service.findUserById).toHaveBeenCalledWith('456')
    expect(result).toEqual(userResponse)
  })

  it('should find user by email', async () => {
    const email = 'test@mail.com'
    const userResponse = UserTestFactory.createUserResponse()
    service.getUserByEmail = jest.fn().mockResolvedValue(userResponse)

    const result = await controller.findUserByEmail({ data: email })

    expect(service.getUserByEmail).toHaveBeenCalledWith(email)
    expect(result).toEqual(userResponse)
  })
})
