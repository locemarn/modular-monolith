import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { EventBus, UserCreatedEvent } from '../../../../shared/events'
import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import { UserEntity } from '../../domain/entities/user.entity'
import { UserDeletedEvent } from '../../domain/events/user-deleted.event'
import { IUserRepositoryInterface } from '../../domain/repositories/user.repository.interface'
import { Password } from '../../domain/value-objects'
import { UserServiceService } from './user-service.service'

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn().mockReturnValue('hashedPassword123'),
}))

describe('UserServiceService (Integration)', () => {
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
  })

  describe('getHello', () => {
    it('should return the hello message', () => {
      expect(service.getHello()).toBe('Hello World from user service!')
    })
  })

  describe('login', () => {
    it('should login successfully and return access token', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const mockUser = UserTestFactory.createUserEntity()

      userRepository.getUserByEmail.mockResolvedValue(mockUser)
      jwtService.sign.mockReturnValue('jwt_token')

      const loginDto = UserTestFactory.createLoginInput()
      const result = await service.login(loginDto)

      expect(userRepository.getUserByEmail).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalled()
      expect(result).toEqual({ accessToken: 'jwt_token' })
    })

    it('should throw error if user is not found', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null)

      const loginDto = {
        ...UserTestFactory.createLoginInput(),
        email: 'notfound@example.com',
      }

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('createUserService', () => {
    it('should create user and publish UserCreatedEvent', async () => {
      const mockUser = UserTestFactory.createUserEntity()

      userRepository.createUser.mockResolvedValue(mockUser)

      const createUserDto = UserTestFactory.createValidUserInput()
      const result = await service.createUserService(createUserDto)

      expect(userRepository.createUser).toHaveBeenCalled()
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(UserCreatedEvent),
      )
      expect(result).toHaveProperty('id')
    })

    it('should handle repository errors when creating user', async () => {
      userRepository.createUser.mockRejectedValue(new Error('DB error'))

      const createUserDto = UserTestFactory.createValidUserInput()

      await expect(service.createUserService(createUserDto)).rejects.toThrow(
        'DB error',
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should return user DTO by email', async () => {
      const mockUser = UserTestFactory.createUserEntity()
      userRepository.getUserByEmail.mockResolvedValue(mockUser)

      const result = await service.getUserByEmail('test@example.com')

      expect(userRepository.getUserByEmail).toHaveBeenCalled()
      expect(result).toHaveProperty('email')
    })
  })

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const mockUser = UserTestFactory.createUserEntity()
      userRepository.getUserById.mockResolvedValue(mockUser)

      const result = await service.findUserById('id101')
      expect(userRepository.getUserById).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
    })

    it('should throw error when user is not found', async () => {
      userRepository.getUserById.mockResolvedValue(null)

      await expect(service.findUserById('missing')).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('deleteUserById', () => {
    it('should delete user and publish UserDeletedEvent', async () => {
      const mockUser = UserTestFactory.createUserEntity()
      userRepository.deleteUserById.mockResolvedValue(mockUser)

      const result = await service.deleteUserById('id789')

      expect(userRepository.deleteUserById).toHaveBeenCalled()
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(UserDeletedEvent),
      )
      expect(result).toHaveProperty('id')
    })

    it('should return null if user not found', async () => {
      userRepository.deleteUserById.mockResolvedValue(null)

      const result = await service.deleteUserById('unknown_id')
      expect(result).toBeNull()
    })
  })
})
