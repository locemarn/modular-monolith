import {
  AuthTokenResponse,
  CreateUserInput,
  DeleteUserInput,
  GetUserByEmailInput,
  GetUserByIdInput,
  GrpcMetadata,
  LoginInput,
} from '../../../api-gateway/src/dtos'

export class ApiGatewayTestFactory {
  static createGrpcMetadata(): GrpcMetadata {
    return {
      user: {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        username: 'testuser',
      },
    }
  }

  static createGetUserByIdInput(): GetUserByIdInput {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
    }
  }

  static createGetUserByEmailInput(): GetUserByEmailInput {
    return {
      email: 'test@example.com',
    }
  }

  static createDeleteUserInput(): DeleteUserInput {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
    }
  }

  static createAuthTokenResponse(): AuthTokenResponse {
    return {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token',
    }
  }

  static createCurrentUser() {
    return {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
    }
  }

  static createMultipleLoginInputs(count: number): LoginInput[] {
    return Array.from({ length: count }, (_, index) => ({
      email: `user${index}@example.com`,
      password: 'ValidPass123!',
    }))
  }

  static createMultipleCreateUserInputs(count: number): CreateUserInput[] {
    return Array.from({ length: count }, (_, index) => ({
      email: `user${index}@example.com`,
      password: 'ValidPass123!',
      username: `user${index}`,
    }))
  }

  static createUserResponseWithPassword() {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      password: 'ValidPass123!',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  }
}
