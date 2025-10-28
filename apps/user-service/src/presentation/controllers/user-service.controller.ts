import { Controller, Get, UseFilters } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { RABBITMQ_CONSTANTS } from '../../../../shared/constants/rabbitmq'
import { AuthTokens } from '../../../../shared/interfaces/jwt-payload.interface'
import {
  LoginUserDto,
  RegisterUserDto,
  UserResponseDto,
} from '../../application/dtos'
import { UserServiceService } from '../../application/services/user-service.service'
import { AllExceptionsFilter } from '../filters/rpc-exception.filter'

@Controller()
@UseFilters(new AllExceptionsFilter())
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @Get()
  getHello(): string {
    return this.userServiceService.getHello()
  }

  @MessagePattern(RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER)
  async createUser(
    @Payload() dto: { data: RegisterUserDto },
  ): Promise<UserResponseDto> {
    return await this.userServiceService.createUserService(dto.data)
  }

  @MessagePattern(RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER)
  async login(@Payload() dto: { data: LoginUserDto }): Promise<AuthTokens> {
    return await this.userServiceService.login(dto.data)
  }

  @MessagePattern(RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER)
  async deleteUser(
    @Payload()
    payload: { data: string; metadata?: { requestUserId?: string } } | string,
  ): Promise<UserResponseDto | null> {
    const id = typeof payload === 'string' ? payload : payload.data
    const metadata = typeof payload === 'object' ? payload.metadata : undefined
    const requestUserId = metadata?.requestUserId

    return await this.userServiceService.deleteUserById(id, requestUserId)
  }

  @MessagePattern(RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID)
  async findUserById(
    @Payload()
    payload: { data: string; metadata?: { requestUserId?: string } } | string,
  ): Promise<UserResponseDto> {
    const id = typeof payload === 'string' ? payload : payload.data
    return await this.userServiceService.findUserById(id)
  }

  @MessagePattern(RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL)
  async findUserByEmail(
    @Payload()
    payload: { data: string; metadata?: { requestUserId?: string } },
  ): Promise<UserResponseDto> {
    return await this.userServiceService.getUserByEmail(payload.data)
  }
}
