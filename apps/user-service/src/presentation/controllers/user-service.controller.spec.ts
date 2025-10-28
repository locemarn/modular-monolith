import { Test, TestingModule } from '@nestjs/testing'
import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import { UserServiceService } from '../../application/services/user-service.service'
import { UserServiceController } from './user-service.controller'

describe('UserServiceController', () => {
  let controller: UserServiceController
  let service: jest.Mocked<UserServiceService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceController],
      providers: [
        {
          provide: UserServiceService,
          useValue: {
            getHello: jest.fn(),
            createUserService: jest.fn(),
            login: jest.fn(),
            deleteUserById: jest.fn(),
            findUserById: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<UserServiceController>(UserServiceController)
    service = module.get(UserServiceService)
  })

  it('should return hello string', () => {
    const mockResponse = 'Hello!'
    service.getHello.mockReturnValue(mockResponse)

    expect(controller.getHello()).toBe(mockResponse)
    expect(service.getHello).toHaveBeenCalled()
  })

  it('should create user', async () => {
    const dto = UserTestFactory.createValidUserInput()
    const userResponse = UserTestFactory.createUserResponse()
    service.createUserService.mockResolvedValue(userResponse)

    const result = await controller.createUser({ data: dto })

    expect(service.createUserService).toHaveBeenCalledWith(dto)
    expect(result).toBe(userResponse)
  })

  it('should login user', async () => {
    const dto = UserTestFactory.createLoginInput()
    const tokens = {
      accessToken: 'token',
      refreshToken: 'refresh',
    }
    service.login.mockResolvedValue(tokens)

    const result = await controller.login({ data: dto })

    expect(service.login).toHaveBeenCalledWith(dto)
    expect(result).toBe(tokens)
  })

  it('should delete user by string id', async () => {
    const userId = '123'
    const userResponse = UserTestFactory.createUserResponse()
    service.deleteUserById.mockResolvedValue(userResponse)

    const result = await controller.deleteUser(userId)

    expect(service.deleteUserById).toHaveBeenCalledWith(userId, undefined)
    expect(result).toBe(userResponse)
  })

  it('should delete user by payload object', async () => {
    const payload = { data: '123', metadata: { requestUserId: 'reqUserId' } }
    const userResponse = UserTestFactory.createUserResponse()
    service.deleteUserById.mockResolvedValue(userResponse)

    const result = await controller.deleteUser(payload)

    expect(service.deleteUserById).toHaveBeenCalledWith('123', 'reqUserId')
    expect(result).toBe(userResponse)
  })

  it('should find user by id with string payload', async () => {
    const userId = 'abc'
    const userResponse = UserTestFactory.createUserResponse()
    service.findUserById.mockResolvedValue(userResponse)

    const result = await controller.findUserById(userId)

    expect(service.findUserById).toHaveBeenCalledWith(userId)
    expect(result).toBe(userResponse)
  })

  it('should find user by id with payload object', async () => {
    const payload = { data: 'abc', metadata: {} }
    const userResponse = UserTestFactory.createUserResponse()
    service.findUserById.mockResolvedValue(userResponse)

    const result = await controller.findUserById(payload)

    expect(service.findUserById).toHaveBeenCalledWith('abc')
    expect(result).toBe(userResponse)
  })

  it('should find user by email', async () => {
    const email = 'test@example.com'
    const userResponse = UserTestFactory.createUserResponse()
    service.getUserByEmail.mockResolvedValue(userResponse)

    const result = await controller.findUserByEmail({ data: email })

    expect(service.getUserByEmail).toHaveBeenCalledWith(email)
    expect(result).toBe(userResponse)
  })
})
