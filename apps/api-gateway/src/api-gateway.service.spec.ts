import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { UserTestFactory } from '../../shared/test-utils/factories/user-test.factory'
import { RABBITMQ_SERVICE } from '../../shared/rabbitmq/rabbitmq.module'
import { RabbitmqService } from '../../shared/rabbitmq/rabbitmq.service'
import { ApiGatewayService } from './api-gateway.service'

describe('ApiGatewayService', () => {
  let service: ApiGatewayService
  let rabbitmqService: jest.Mocked<RabbitmqService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiGatewayService,
        {
          provide: RABBITMQ_SERVICE,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ApiGatewayService>(ApiGatewayService)
    rabbitmqService = module.get(
      RABBITMQ_SERVICE,
    ) as jest.Mocked<RabbitmqService>
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return hello message', () => {
    expect(service.getHello()).toBe('Hello World!')
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginInput = UserTestFactory.createLoginInput()
      const expectedResponse = { accessToken: 'test-token' }

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.login(loginInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
        loginInput,
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should handle login error', async () => {
      const loginInput = UserTestFactory.createLoginInput()
      const error = new Error('Login failed')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(service.login(loginInput)).rejects.toThrow('Login failed')
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserInput = UserTestFactory.createValidUserInput()
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.createUser(createUserInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
        createUserInput,
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should handle create user error', async () => {
      const createUserInput = UserTestFactory.createValidUserInput()
      const error = new Error('User creation failed')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(service.createUser(createUserInput)).rejects.toThrow(
        'User creation failed',
      )
    })
  })

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const userId = '123'
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.getUserById(userId)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
        userId,
        undefined,
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should get user by id with current user metadata', async () => {
      const userId = '123'
      const currentUser = {
        sub: 'current-user-id',
        email: 'current@test.com',
        username: 'current',
      }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.getUserById(userId, currentUser)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
        userId,
        { requestUserId: currentUser.sub },
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should handle get user by id error', async () => {
      const userId = '123'
      const error = new Error('User not found')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(service.getUserById(userId)).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should get user by email successfully', async () => {
      const email = 'test@example.com'
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.getUserByEmail(email)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
        email,
        undefined,
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should get user by email with current user metadata', async () => {
      const email = 'test@example.com'
      const currentUser = {
        sub: 'current-user-id',
        email: 'current@test.com',
        username: 'current',
      }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.getUserByEmail(email, currentUser)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
        email,
        { requestUserId: currentUser.sub },
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should handle get user by email error', async () => {
      const email = 'test@example.com'
      const error = new Error('User not found')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(service.getUserByEmail(email)).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const userId = '123'
      const currentUser = {
        sub: 'current-user-id',
        email: 'current@test.com',
        username: 'current',
      }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.deleteUserById(userId, currentUser)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
        userId,
        { requestUserId: currentUser.sub },
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should delete user without current user metadata', async () => {
      const userId = '123'
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await service.deleteUserById(userId)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
        userId,
        undefined,
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should handle delete user error', async () => {
      const userId = '123'
      const error = new Error('Delete failed')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(service.deleteUserById(userId)).rejects.toThrow(
        'Delete failed',
      )
    })
  })
})
