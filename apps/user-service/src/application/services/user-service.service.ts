import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { EventBus, UserCreatedEvent } from '../../../../shared/events'
import { JwtPayload } from '../../../../shared/interfaces/jwt-payload.interface'
import { UserEntity } from '../../domain/entities/user.entity'
import { UserDeletedEvent } from '../../domain/events/user-deleted.event'
import { IUserRepositoryInterface } from '../../domain/repositories/user.repository.interface'
import { EmailValueObject } from '../../domain/value-objects'
import { UserRegisteredEventHandler } from '../../handlers/user-registered.eventhandler'
import { UserMapper } from '../../infrastructure/mapper/user.mapper'
import { LoginUserDto, RegisterUserDto, UserResponseDto } from '../dtos'

@Injectable()
export class UserServiceService {
  private readonly logger = new Logger(UserServiceService.name)

  private shouldLog(): boolean {
    return process.env.NODE_ENV !== 'test'
  }

  constructor(
    @Inject('IUserRepositoryInterface')
    private readonly userRepository: IUserRepositoryInterface,
    @Inject('EventBus')
    private readonly eventBus: EventBus,
    private readonly jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World from user service!'
  }

  async login(dto: LoginUserDto): Promise<{ accessToken: string }> {
    try {
      const email = EmailValueObject.create(dto.email)
      const user = await this.userRepository.getUserByEmail(email)
      if (!user) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.password.toString(),
      )

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const payload: JwtPayload = {
        sub: user.id.value,
        email: user.email.toString(),
        username: user.username.toString(),
      }

      const accessToken = this.jwtService.sign(payload)

      if (this.shouldLog()) {
        this.logger.log(`User logged in successfully: ${user.id.value}`)
      }

      return { accessToken }
    } catch (error) {
      if (error instanceof Error && this.shouldLog()) {
        this.logger.error(`Failed to login: ${error.message}`, error.stack)
      }
      throw error
    }
  }

  async createUserService(dto: RegisterUserDto): Promise<UserResponseDto> {
    try {
      const userEntity = UserEntity.createUser(
        {
          email: dto.email,
          username: dto.username,
          password: dto.password,
        },
        (password: string) => this.hashPassword(password),
      )

      const savedUser = await this.userRepository.createUser(userEntity)
      if (this.shouldLog()) {
        this.logger.log(`User created successfully: ${savedUser.id.value}`)
      }

      await this.eventBus.publish(
        new UserCreatedEvent({
          id: savedUser.id.toString(),
          email: dto.email,
          username: dto.username,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        }),
      )

      return UserMapper.toResponseDto(savedUser)
    } catch (error) {
      if (error instanceof Error && this.shouldLog()) {
        this.logger.error(
          `Failed to create user: ${error.message}`,
          error.stack,
        )

        const dbError = error as Error & { code?: string; detail?: string }

        if (dbError.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error(
            `Duplicate entry: ${dbError.detail || 'Email or username already exists'}`,
          )
        }
      }

      throw error
    }
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    try {
      const emailValueObject = EmailValueObject.create(email)
      const user = await this.userRepository.getUserByEmail(emailValueObject)
      if (!user) throw new Error('User not found')
      return UserMapper.toResponseDto(user)
    } catch (error) {
      if (error instanceof Error && this.shouldLog()) {
        this.logger.error(
          `Failed to get user by email: ${error.message}`,
          error.stack,
        )
      }
      throw error
    }
  }

  async findUserById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.getUserById(id)
      if (!user) throw new Error('User not found')
      return UserMapper.toResponseDto(user)
    } catch (error) {
      if (error instanceof Error && this.shouldLog()) {
        this.logger.error(
          `Failed to find user by id: ${error.message}`,
          error.stack,
        )
      }
      throw error
    }
  }

  async deleteUserById(
    id: string,
    requestUserId?: string,
  ): Promise<UserResponseDto | null> {
    try {
      const deletedUser = await this.userRepository.deleteUserById(id)
      if (!deletedUser) return null

      await this.eventBus.publish(
        new UserDeletedEvent({
          id: deletedUser.id.toString(),
          email: deletedUser.email.toString(),
          username: deletedUser.username.toString(),
          createdAt: deletedUser.createdAt,
          updatedAt: deletedUser.updatedAt,
          requestUserId,
        }),
      )
      if (this.shouldLog()) {
        this.logger.log(`User with ID ${id} deleted successfully`)
      }
      return UserMapper.toResponseDto(deletedUser)
    } catch (error) {
      if (error instanceof Error && this.shouldLog()) {
        this.logger.error(
          `Failed to delete user by id: ${error.message}`,
          error.stack,
        )
      }
      throw error
    }
  }

  /**
   * Hashes a password using bcrypt.
   *
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  private hashPassword = (password: string) => {
    const saltRounds = 10
    return bcrypt.hashSync(password, saltRounds)
  }
}
