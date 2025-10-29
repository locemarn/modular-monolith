import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiGatewayTestFactory } from '../../shared/test-utils/factories/api-gateway-test.factory'
import { UserTestFactory } from '../../shared/test-utils/factories/user-test.factory'
import { ApiGatewayController } from './api-gateway.controller'
import { ApiGatewayService } from './api-gateway.service'
import { JwtGrpcInterceptor } from './infrastructure/interceptors/jwt-grpc.interceptor'

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController
  let service: jest.Mocked<ApiGatewayService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
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
          provide: ApiGatewayService,
          useValue: {
            getHello: jest.fn(),
            login: jest.fn(),
            createUser: jest.fn(),
            getUserById: jest.fn(),
            getUserByEmail: jest.fn(),
            deleteUserById: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<ApiGatewayController>(ApiGatewayController)
    service = module.get(ApiGatewayService) as jest.Mocked<ApiGatewayService>
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return hello message', () => {
    const mockResponse = 'Hello World!'
    service.getHello.mockReturnValue(mockResponse)

    expect(controller.getHello()).toBe(mockResponse)
    expect(service.getHello).toHaveBeenCalled()
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginInput = UserTestFactory.createLoginInput()
      const expectedResponse = ApiGatewayTestFactory.createAuthTokenResponse()

      service.login.mockResolvedValue(expectedResponse)

      const result = await controller.login(loginInput)

      expect(service.login).toHaveBeenCalledWith(loginInput)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserInput = UserTestFactory.createValidUserInput()
      const expectedResponse =
        ApiGatewayTestFactory.createUserResponseWithPassword()

      service.createUser.mockResolvedValue(expectedResponse)

      const result = await controller.createUser(createUserInput)

      expect(service.createUser).toHaveBeenCalledWith(createUserInput)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const getUserByIdInput = ApiGatewayTestFactory.createGetUserByIdInput()
      const metadata = ApiGatewayTestFactory.createGrpcMetadata()
      const expectedResponse =
        ApiGatewayTestFactory.createUserResponseWithPassword()

      service.getUserById.mockResolvedValue(expectedResponse)

      const result = await controller.getUserById(getUserByIdInput, metadata)

      expect(service.getUserById).toHaveBeenCalledWith(
        getUserByIdInput.id,
        metadata.user,
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getUserByEmail', () => {
    it('should get user by email successfully', async () => {
      const getUserByEmailInput =
        ApiGatewayTestFactory.createGetUserByEmailInput()
      const expectedResponse =
        ApiGatewayTestFactory.createUserResponseWithPassword()

      service.getUserByEmail.mockResolvedValue(expectedResponse)

      const result = await controller.getUserByEmail(getUserByEmailInput)

      expect(service.getUserByEmail).toHaveBeenCalledWith(
        getUserByEmailInput.email,
      )
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const deleteUserInput = ApiGatewayTestFactory.createDeleteUserInput()
      const metadata = ApiGatewayTestFactory.createGrpcMetadata()
      const expectedResponse =
        ApiGatewayTestFactory.createUserResponseWithPassword()

      service.deleteUserById.mockResolvedValue(expectedResponse)

      const result = await controller.deleteUser(deleteUserInput, metadata)

      expect(service.deleteUserById).toHaveBeenCalledWith(
        deleteUserInput.id,
        metadata.user,
      )
      expect(result).toEqual(expectedResponse)
    })
  })
})
