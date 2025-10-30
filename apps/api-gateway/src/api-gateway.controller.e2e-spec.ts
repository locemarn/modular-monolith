import { INestApplication } from '@nestjs/common'
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

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication
  let controller: ApiGatewayController
  let rabbitmqService: jest.Mocked<RabbitmqService>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    app = moduleFixture.createNestApplication()
    await app.init()

    controller = moduleFixture.get<ApiGatewayController>(ApiGatewayController)
    rabbitmqService = moduleFixture.get(
      RABBITMQ_SERVICE,
    ) as jest.Mocked<RabbitmqService>
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Health Check', () => {
    it('should return hello message', () => {
      expect(controller.getHello()).toBe('Hello World!')
    })
  })

  describe('User Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      const createUserInput = UserTestFactory.createValidUserInput()
      const createdUserResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValueOnce(of(createdUserResponse))

      const createdUser = await controller.createUser(createUserInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
        createUserInput,
      )
      expect(createdUser).toEqual(createdUserResponse)

      const loginInput = UserTestFactory.createLoginInput()
      const loginResponse = { accessToken: 'e2e-test-token' }

      rabbitmqService.sendMessage.mockReturnValueOnce(of(loginResponse))

      const loginResult = await controller.login(loginInput)

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
        loginInput,
      )
      expect(loginResult).toEqual(loginResponse)
    })
  })

  describe('User Management Flow', () => {
    it('should complete full user management flow', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000'
      const userEmail = 'test@example.com'
      const currentUser = {
        sub: userId,
        email: userEmail,
        username: 'testuser',
      }
      const userResponse = UserTestFactory.createUserResponse()

      rabbitmqService.sendMessage.mockReturnValueOnce(of(userResponse))

      const userById = await controller.getUserById(
        { id: userId },
        { user: currentUser },
      )

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
        userId,
        { requestUserId: currentUser.sub },
      )
      expect(userById).toEqual(userResponse)

      rabbitmqService.sendMessage.mockReturnValueOnce(of(userResponse))

      const userByEmail = await controller.getUserByEmail({ email: userEmail })

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
        userEmail,
        undefined,
      )
      expect(userByEmail).toEqual(userResponse)

      rabbitmqService.sendMessage.mockReturnValueOnce(of(userResponse))

      const deletedUser = await controller.deleteUser(
        { id: userId },
        { user: currentUser },
      )

      expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
        RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
        userId,
        { requestUserId: currentUser.sub },
      )
      expect(deletedUser).toEqual(userResponse)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle user creation failure', async () => {
      const createUserInput = UserTestFactory.createInvalidUserInput()
      const error = new Error('Invalid user data')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(controller.createUser(createUserInput)).rejects.toThrow(
        'Invalid user data',
      )
    })

    it('should handle login failure', async () => {
      const loginInput = {
        ...UserTestFactory.createLoginInput(),
        password: 'wrong-password',
      }
      const error = new Error('Invalid credentials')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(controller.login(loginInput)).rejects.toThrow(
        'Invalid credentials',
      )
    })

    it('should handle user not found scenarios', async () => {
      const nonExistentUserId = 'non-existent-id'
      const error = new Error('User not found')

      rabbitmqService.sendMessage.mockImplementation(() => {
        throw error
      })

      await expect(
        controller.getUserById(
          { id: nonExistentUserId },
          {
            user: {
              sub: 'current-user',
              email: 'current@test.com',
              username: 'current',
            },
          },
        ),
      ).rejects.toThrow('User not found')

      await expect(
        controller.getUserByEmail({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow('User not found')
    })
  })

  describe('Integration with User Service', () => {
    it('should send correct message patterns to user service', async () => {
      const testCases = [
        {
          method: 'createUser',
          input: UserTestFactory.createValidUserInput(),
          pattern: RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
        },
        {
          method: 'login',
          input: UserTestFactory.createLoginInput(),
          pattern: RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
        },
      ]

      for (const testCase of testCases) {
        const mockResponse =
          testCase.method === 'login'
            ? { accessToken: 'test-token' }
            : UserTestFactory.createUserResponse()

        rabbitmqService.sendMessage.mockReturnValueOnce(of(mockResponse))

        await controller[testCase.method](testCase.input)

        expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          testCase.pattern,
          testCase.input,
        )
      }
    })

    it('should handle metadata correctly for protected endpoints', async () => {
      const userId = '123'
      const currentUser = {
        sub: 'current-user-id',
        email: 'current@test.com',
        username: 'current',
      }
      const userResponse = UserTestFactory.createUserResponse()

      const protectedEndpoints = [
        {
          method: 'getUserById',
          input: { id: userId },
          pattern: RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
          expectedData: userId,
        },
        {
          method: 'deleteUser',
          input: { id: userId },
          pattern: RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
          expectedData: userId,
        },
      ]

      for (const endpoint of protectedEndpoints) {
        rabbitmqService.sendMessage.mockReturnValueOnce(of(userResponse))

        await controller[endpoint.method](endpoint.input, { user: currentUser })

        expect(rabbitmqService.sendMessage).toHaveBeenCalledWith(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          endpoint.pattern,
          endpoint.expectedData,
          { requestUserId: currentUser.sub },
        )
      }
    })
  })

  describe('Performance and Load', () => {
    it('should handle multiple concurrent requests', async () => {
      console.log('⚡ Testing concurrent requests...')

      const concurrentRequests = 5
      const loginInput = UserTestFactory.createLoginInput()
      const loginResponse = { accessToken: 'concurrent-test-token' }

      rabbitmqService.sendMessage.mockReturnValue(of(loginResponse))

      const promises = Array.from({ length: concurrentRequests }, () =>
        controller.login(loginInput),
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(concurrentRequests)
      results.forEach((result) => {
        expect(result).toEqual(loginResponse)
      })

      expect(rabbitmqService.sendMessage).toHaveBeenCalledTimes(
        concurrentRequests,
      )
    })
  })
})
