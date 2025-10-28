import { JwtService } from '@nestjs/jwt'
import { JwtTestFactory } from '../factories/jwt-test.factory'

export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue(JwtTestFactory.createValidToken()),
  signAsync: jest.fn().mockResolvedValue(JwtTestFactory.createValidToken()),
  verify: jest.fn().mockReturnValue(JwtTestFactory.createPayload()),
  verifyAsync: jest.fn().mockResolvedValue(JwtTestFactory.createPayload()),
  decode: jest.fn().mockReturnValue(JwtTestFactory.createPayload()),
})

export type MockJwtService = ReturnType<typeof createMockJwtService>

export const mockJwtServiceProvider = {
  provide: JwtService,
  useFactory: createMockJwtService,
}
