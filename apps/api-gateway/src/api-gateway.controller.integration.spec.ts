import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { RABBITMQ_SERVICE } from '../../shared/rabbitmq/rabbitmq.module'
import { RabbitmqService } from '../../shared/rabbitmq/rabbitmq.service'
import { UserTestFactory } from '../../shared/test-utils/factories/user-test.factory'
import { ApiGatewayController } from './api-gateway.controller'
import { ApiGatewayService } from './api-gateway.service'
import { JwtGrpcInterceptor } from './infrastructure/interceptors/jwt-grpc.interceptor'

describe('ApiGatewayController (Integration)', () => {
  let controller: ApiGatewayController
  let rabbitmqService: jest.Mocked<RabbitmqService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        ApiGatewayService,
        JwtGrpcInterceptor,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({
              sub: 'test-user-id',
              email: 'test@example.com',
            }),
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: RABBITMQ_SERVICE,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<ApiGatewayController>(ApiGatewayController)
    rabbitmqService = module.get(
      RABBITMQ_SERVICE,
    ) as jest.Mocked<RabbitmqService>
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return hello message', () => {
    expect(controller.getHello()).toBe('Hello World api gateway service!')
  })

  describe('login flow', () => {
    it('should complete login flow successfully', async () => {
      const loginInput = UserTestFactory.createLoginInput()
      const expectedResponse = { accessToken: 'integration-test-token' }

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await controller.login(loginInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
        loginInput,
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('user creation flow', () => {
    it('should complete user creation flow successfully', async () => {
      const createUserInput = UserTestFactory.createValidUserInput()
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await controller.createUser(createUserInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
        createUserInput,
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('user retrieval flow', () => {
    it('should complete get user by id flow successfully', async () => {
      const getUserByIdInput = { id: '123' }
      const metadata = {
        user: { sub: 'user-id', email: 'user@test.com', username: 'user' },
      }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await controller.getUserById(getUserByIdInput, metadata)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
        getUserByIdInput.id,
        { requestUserId: metadata.user.sub },
      )
      expect(result).toEqual(expectedResponse)
    })

    it('should complete get user by email flow successfully', async () => {
      const getUserByEmailInput = { email: 'test@example.com' }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await controller.getUserByEmail(getUserByEmailInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
        getUserByEmailInput.email,
        undefined,
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('user deletion flow', () => {
    it('should complete delete user flow successfully', async () => {
      const deleteUserInput = { id: '123' }
      const metadata = {
        user: { sub: 'user-id', email: 'user@test.com', username: 'user' },
      }
      const expectedResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValue(of(expectedResponse))

      const result = await controller.deleteUser(deleteUserInput, metadata)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
        deleteUserInput.id,
        { requestUserId: metadata.user.sub },
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('error handling', () => {
    it('should handle RabbitMQ service errors', async () => {
      const loginInput = UserTestFactory.createLoginInput()
      const error = new Error('RabbitMQ connection failed')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(controller.login(loginInput)).rejects.toThrow(
        'RabbitMQ connection failed',
      )
    })
  })
})
