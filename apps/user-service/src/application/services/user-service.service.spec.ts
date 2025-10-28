import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { EventBus } from '../../../../shared/events'
import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import { UserEntity } from '../../domain/entities/user.entity'
import { IUserRepositoryInterface } from '../../domain/repositories/user.repository.interface'
import { UserServiceService } from './user-service.service'

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn().mockReturnValue('hashedPassword123'),
}))

describe('UserServiceService', () => {
  let service: UserServiceService
  let userRepository: jest.Mocked<IUserRepositoryInterface>
  let eventBus: jest.Mocked<EventBus>
  let jwtService: jest.Mocked<JwtService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceService,
        {
          provide: 'IUserRepositoryInterface',
          useValue: {
            getUserByEmail: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            deleteUserById: jest.fn(),
          },
        },
        {
          provide: 'EventBus',
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UserServiceService>(UserServiceService)
    userRepository = module.get(
      'IUserRepositoryInterface',
    ) as jest.Mocked<IUserRepositoryInterface>
    eventBus = module.get('EventBus') as jest.Mocked<EventBus>
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>

    jest.clearAllMocks()
  })

  it('should return hello world from the user service', () => {
    expect(service.getHello()).toBe('Hello World from user service!')
  })

  it('should login the user and return access token', async () => {
    const mockUser = UserTestFactory.createUserEntityWithHashedPassword()

    userRepository.getUserByEmail.mockResolvedValue(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    jwtService.sign.mockReturnValue('token')

    const loginDto = UserTestFactory.createLoginInput()
    const result = await service.login(loginDto)

    expect(userRepository.getUserByEmail).toHaveBeenCalled()
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginDto.password,
      'hashedPassword123',
    )
    expect(jwtService.sign).toHaveBeenCalled()
    expect(result).toEqual({ accessToken: 'token' })
  })

  it('should create a new user and publish UserCreatedEvent', async () => {
    const mockUser = UserTestFactory.createUserEntity()

    userRepository.createUser.mockResolvedValue(mockUser)
    ;(bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword')

    const dto = UserTestFactory.createValidUserInput()

    const result = await service.createUserService(dto)

    expect(userRepository.createUser).toHaveBeenCalled()
    expect(eventBus.publish).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })

  it('should get user by email', async () => {
    const user = UserTestFactory.createUserEntity()

    userRepository.getUserByEmail.mockResolvedValue(user)

    const result = await service.getUserByEmail('test@example.com')

    expect(userRepository.getUserByEmail).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })

  it('should find user by id', async () => {
    const user = UserTestFactory.createUserEntity()

    userRepository.getUserById.mockResolvedValue(user)

    const result = await service.findUserById('123')

    expect(userRepository.getUserById).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })

  it('should delete user by id and publish UserDeletedEvent', async () => {
    const deletedUser = UserTestFactory.createUserEntity()

    userRepository.deleteUserById.mockResolvedValue(deletedUser)

    const result = await service.deleteUserById('123')

    expect(userRepository.deleteUserById).toHaveBeenCalled()
    expect(eventBus.publish).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })
})
