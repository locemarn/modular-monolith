import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../../interfaces/jwt-payload.interface'

export class JwtTestFactory {
  private static jwtService = new JwtService({
    secret: 'test-secret',
    signOptions: { expiresIn: '1h' },
  })

  static createValidToken(payload?: Partial<JwtPayload>): string {
    const defaultPayload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }

    return this.jwtService.sign({ ...defaultPayload, ...payload })
  }

  static createExpiredToken(): string {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600,
    }

    return this.jwtService.sign(payload)
  }

  static createInvalidToken(): string {
    return 'invalid.jwt.token'
  }

  static createMalformedToken(): string {
    return 'malformed-token-without-dots'
  }

  static createPayload(): JwtPayload {
    return {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }
  }

  static createAuthHeader(token?: string): string {
    return `Bearer ${token || this.createValidToken()}`
  }
}
