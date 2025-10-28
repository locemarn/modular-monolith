import { Inject, Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { RABBITMQ_CONSTANTS } from '../../shared/constants/rabbitmq'
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface'
import { UserResponse } from '../../shared/interfaces/users'
import { RABBITMQ_SERVICE } from '../../shared/rabbitmq/rabbitmq.module'
import { RabbitmqService } from '../../shared/rabbitmq/rabbitmq.service'
import { AuthTokenResponse, CreateUserInput, LoginInput } from './dtos'

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name)

  private shouldLog(): boolean {
    return process.env.NODE_ENV !== 'test'
  }

  constructor(
    @Inject(RABBITMQ_SERVICE)
    private readonly rabbitmqService: RabbitmqService,
  ) {}
  getHello(): string {
    return 'Hello World!'
  }

  async login(data: LoginInput): Promise<AuthTokenResponse> {
    try {
      if (this.shouldLog()) {
        this.logger.log(`Login attempt for email: ${data.email}`)
      }

      return await firstValueFrom(
        this.rabbitmqService.sendMessage<AuthTokenResponse, LoginInput>(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
          data,
        ),
      )
    } catch (error) {
      if (this.shouldLog()) {
        this.logger.error(`Login failed for ${data.email}`, error)
      }
      throw error
    }
  }

  async getUserById(
    id: string,
    currentUser?: JwtPayload,
  ): Promise<UserResponse> {
    try {
      if (this.shouldLog()) {
        this.logger.debug(`Fetching user by ID: ${id}`)
      }
      return await firstValueFrom(
        this.rabbitmqService.sendMessage<UserResponse, string>(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
          id,
          currentUser ? { requestUserId: currentUser.sub } : undefined,
        ),
      )
    } catch (error) {
      if (this.shouldLog()) {
        this.logger.error(`Failed to fetch user by ID: ${id}`, error)
      }
      throw error
    }
  }

  async createUser(data: CreateUserInput): Promise<UserResponse> {
    try {
      if (this.shouldLog()) {
        this.logger.log(`Creating user: ${data.email}`)
      }

      const result = await firstValueFrom(
        this.rabbitmqService.sendMessage<UserResponse, CreateUserInput>(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          data,
        ),
      )
      if (this.shouldLog()) {
        this.logger.log(`User created successfully: ${result.id}`)
      }
      return result
    } catch (error) {
      if (this.shouldLog()) {
        this.logger.error(`Failed to create user: ${data.email}`, error)
      }
      throw error
    }
  }

  async getUserByEmail(
    email: string,
    currentUser?: JwtPayload,
  ): Promise<UserResponse> {
    try {
      if (this.shouldLog()) {
        this.logger.debug(`Fetching user by email: ${email}`)
      }

      return await firstValueFrom(
        this.rabbitmqService.sendMessage<UserResponse, string>(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
          email,
          currentUser ? { requestUserId: currentUser.sub } : undefined,
        ),
      )
    } catch (error) {
      if (this.shouldLog()) {
        this.logger.error(`Failed to fetch user by email: ${email}`, error)
      }
      throw error
    }
  }

  async deleteUserById(
    id: string,
    currentUser?: JwtPayload,
  ): Promise<UserResponse> {
    try {
      if (this.shouldLog()) {
        this.logger.log(
          `Deleting user: ${id} by ${currentUser?.sub || 'unknown'}`,
        )
      }

      const result = await firstValueFrom(
        this.rabbitmqService.sendMessage<UserResponse, string>(
          RABBITMQ_CONSTANTS.SERVICES.USER_SERVICE,
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
          id,
          currentUser ? { requestUserId: currentUser.sub } : undefined,
        ),
      )

      if (this.shouldLog()) {
        this.logger.log(`User deleted successfully: ${id}`)
      }
      return result
    } catch (error) {
      if (this.shouldLog()) {
        this.logger.error(`Failed to delete user: ${id}`, error)
      }
      throw error
    }
  }
}
