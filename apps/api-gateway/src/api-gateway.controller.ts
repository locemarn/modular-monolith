import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { User, UserResponse } from '../../shared/interfaces/users'
import { ApiGatewayService } from './api-gateway.service'
import {
  CreateUserInput,
  DeleteUserInput,
  GetUserByEmailInput,
  GetUserByIdInput,
  GrpcMetadata,
  LoginInput,
} from './dtos'
import { JwtGrpcInterceptor } from './infrastructure/interceptors/jwt-grpc.interceptor'

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello()
  }

  /**
   * Login - Público
   * Retorna um token JWT para autenticação
   */
  @GrpcMethod('ApiGatewayService', 'Login')
  async login(data: LoginInput): Promise<{ accessToken: string }> {
    return await this.apiGatewayService.login(data)
  }

  /**
   * Criar usuário - Público
   * Registra um novo usuário no sistema
   */
  @GrpcMethod('ApiGatewayService', 'CreateUser')
  async createUser(data: CreateUserInput): Promise<User> {
    return await this.apiGatewayService.createUser(data)
  }

  /**
   * Buscar usuário por ID - Protegido
   * Requer autenticação JWT
   */
  @GrpcMethod('ApiGatewayService', 'GetUserById')
  @UseInterceptors(JwtGrpcInterceptor)
  async getUserById(
    data: GetUserByIdInput,
    metadata: GrpcMetadata,
  ): Promise<UserResponse> {
    return await this.apiGatewayService.getUserById(data.id, metadata.user)
  }

  /**
   * Buscar usuário por email - Público
   */
  @GrpcMethod('ApiGatewayService', 'GetUserByEmail')
  @UseInterceptors(JwtGrpcInterceptor)
  async getUserByEmail(data: GetUserByEmailInput): Promise<UserResponse> {
    return await this.apiGatewayService.getUserByEmail(data.email)
  }

  /**
   * Deletar usuário - Protegido
   * Requer autenticação JWT. Usuário só pode deletar a própria conta.
   */
  @GrpcMethod('ApiGatewayService', 'DeleteUser')
  @UseInterceptors(JwtGrpcInterceptor)
  async deleteUser(
    data: DeleteUserInput,
    metadata: GrpcMetadata,
  ): Promise<UserResponse> {
    return await this.apiGatewayService.deleteUserById(data.id, metadata.user)
  }
}
