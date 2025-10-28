export interface JwtPayload {
  sub: string
  email: string
  username: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}
