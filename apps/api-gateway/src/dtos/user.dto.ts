export interface LoginInput {
  email: string
  password: string
}

export interface CreateUserInput {
  username: string
  email: string
  password: string
}

export interface GetUserByIdInput {
  id: string
}

export interface GetUserByEmailInput {
  email: string
}

export interface DeleteUserInput {
  id: string
}

export interface GrpcMetadata {
  user?: {
    sub: string
    email: string
    username: string
  }
  [key: string]: unknown
}

export interface AuthTokenResponse {
  accessToken: string
}
