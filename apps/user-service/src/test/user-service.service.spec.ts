import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { EventBus } from '../../../shared/events'
import { LoginUserDto, RegisterUserDto } from '../application/dtos'
import { UserEntity } from '../domain/entities/user.entity'
import { IUserRepositoryInterface } from '../domain/repositories/user.repository.interface'
import { UserServiceService } from '../application/services/user-service.service'

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn(),
}))

describe('UserServiceService (Unit)', () => {
  let service: UserServiceService
  let mockRepository: jest.Mocked<IUserRepositoryInterface>
  let mockJwtService: jest.Mocked<JwtService>
  let mockEventBus: jest.Mocked<EventBus>

  const createTestUser = (): UserEntity => {
    return UserEntity.fromPersistence({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      password: '$2b$10$Hashedpassword',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })
  }

  beforeEach(async () => {
    mockRepository = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      deleteUserById: jest.fn(),
    } as jest.Mocked<IUserRepositoryInterface>

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>

    mockEventBus = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<EventBus>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceService,
        {
          provide: 'IUserRepositoryInterface',
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'EventBus',
          useValue: mockEventBus,
        },
      ],
    }).compile()

    service = module.get<UserServiceService>(UserServiceService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getHello', () => {
    it('should return hello message', () => {
      expect(service.getHello()).toBe('Hello World from user service!')
    })
  })

  describe('createUserService', () => {
    const registerDto: RegisterUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'ValidPass123!',
    }

    it('should create a new user successfully', async () => {
      const testUser = createTestUser()
      ;(bcrypt.hashSync as jest.Mock).mockReturnValue('$2b$10$Hashedpassword')
      mockRepository.createUser.mockResolvedValue(testUser)

      const result = await service.createUserService(registerDto)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email', 'test@example.com')
      expect(result).toHaveProperty('username', 'testuser')
      expect(result).not.toHaveProperty('password')
      expect(mockRepository.createUser).toHaveBeenCalled()
      expect(mockEventBus.publish).toHaveBeenCalled()
    })

    it('should throw error when repository fails', async () => {
      ;(bcrypt.hashSync as jest.Mock).mockReturnValue('$2b$10$Hashedpassword')
      mockRepository.createUser.mockRejectedValue(
        new Error(
          'Invalid password format: Password must contain at least one uppercase lette',
        ),
      )

      await expect(service.createUserService(registerDto)).rejects.toThrow(
        'Invalid password format: Password must contain at least one uppercase lette',
      )
    })
  })

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'ValidPass123!',
    }

    it('should return access token for valid credentials', async () => {
      const testUser = createTestUser()
      mockRepository.getUserByEmail.mockResolvedValue(testUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      mockJwtService.sign.mockReturnValue('mock-jwt-token')

      const result = await service.login(loginDto)

      expect(result).toEqual({ accessToken: 'mock-jwt-token' })
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: testUser.id.value,
        email: testUser.email.toString(),
        username: testUser.username.toString(),
      })
    })

    it('should throw error for non-existent user', async () => {
      mockRepository.getUserByEmail.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials')
    })

    it('should throw error for invalid password', async () => {
      const testUser = createTestUser()
      mockRepository.getUserByEmail.mockResolvedValue(testUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should return user for valid email', async () => {
      const testUser = createTestUser()
      mockRepository.getUserByEmail.mockResolvedValue(testUser)

      const result = await service.getUserByEmail('test@example.com')

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email', 'test@example.com')
      expect(result).not.toHaveProperty('password')
    })

    it('should throw error when user not found', async () => {
      mockRepository.getUserByEmail.mockResolvedValue(null)

      await expect(
        service.getUserByEmail('notfound@example.com'),
      ).rejects.toThrow('User not found')
    })
  })

  describe('findUserById', () => {
    it('should return user for valid id', async () => {
      const testUser = createTestUser()
      mockRepository.getUserById.mockResolvedValue(testUser)

      const result = await service.findUserById(
        '123e4567-e89b-12d3-a456-426614174000',
      )

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
      expect(result).not.toHaveProperty('password')
    })

    it('should throw error when user not found', async () => {
      mockRepository.getUserById.mockResolvedValue(null)

      await expect(service.findUserById('non-existent-id')).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const testUser = createTestUser()
      mockRepository.deleteUserById.mockResolvedValue(testUser)

      const result = await service.deleteUserById(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174000',
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
      expect(result).not.toHaveProperty('password')
      expect(mockEventBus.publish).toHaveBeenCalled()
    })

    it('should return null when user not found', async () => {
      mockRepository.deleteUserById.mockResolvedValue(null)

      const result = await service.deleteUserById(
        'non-existent-id',
        'non-existent-id',
      )

      expect(result).toBeNull()
    })
  })
})
