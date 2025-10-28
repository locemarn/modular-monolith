import { ArgumentsHost } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { throwError } from 'rxjs'
import { AllExceptionsFilter } from './rpc-exception.filter'

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let mockArgumentsHost: ArgumentsHost

  beforeEach(() => {
    filter = new AllExceptionsFilter()
    mockArgumentsHost = {
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ArgumentsHost
  })

  describe('Database Errors', () => {
    it('should handle PostgreSQL unique constraint violation (code 23505)', (done) => {
      const dbError = {
        name: 'QueryFailedError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        detail: 'Key (email)=(test@example.com) already exists.',
      } as Error & { code: string; detail: string }

      const result$ = filter.catch(dbError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 409,
            message: 'Email or username already exists',
            error: 'Conflict',
          })
          done()
        },
      })
    })

    it('should handle duplicate key error message', (done) => {
      const dbError = {
        name: 'Error',
        message:
          'duplicate key value violates unique constraint "users_email_key"',
      } as Error

      const result$ = filter.catch(dbError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 409,
            message: 'Email or username already exists',
            error: 'Conflict',
          })
          done()
        },
      })
    })

    it('should handle unique constraint error message', (done) => {
      const dbError = {
        name: 'Error',
        message: 'unique constraint violation on column email',
      } as Error

      const result$ = filter.catch(dbError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 409,
            message: 'Email or username already exists',
            error: 'Conflict',
          })
          done()
        },
      })
    })
  })

  describe('User Not Found Errors', () => {
    it('should handle user not found error', (done) => {
      const notFoundError = {
        name: 'Error',
        message: 'User not found',
      } as Error

      const result$ = filter.catch(notFoundError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 404,
            message: 'User not found',
            error: 'Not Found',
          })
          done()
        },
      })
    })

    it('should handle user not found error in message', (done) => {
      const notFoundError = {
        name: 'Error',
        message: 'The User not found in database',
      } as Error

      const result$ = filter.catch(notFoundError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 404,
            message: 'User not found',
            error: 'Not Found',
          })
          done()
        },
      })
    })
  })

  describe('Invalid Credentials Errors', () => {
    it('should handle invalid credentials error', (done) => {
      const authError = {
        name: 'Error',
        message: 'Invalid credentials',
      } as Error

      const result$ = filter.catch(authError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          })
          done()
        },
      })
    })

    it('should handle invalid credentials in message', (done) => {
      const authError = {
        name: 'Error',
        message: 'Login failed: Invalid credentials provided',
      } as Error

      const result$ = filter.catch(authError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          })
          done()
        },
      })
    })
  })

  describe('Validation Errors', () => {
    it('should handle BadRequestException with string message', (done) => {
      const validationError = {
        name: 'BadRequestException',
        message: 'Validation failed',
        status: 400,
        response: {
          statusCode: 400,
          message: 'Email must be a valid email address',
          error: 'Bad Request',
        },
      } as Error & {
        status: number
        response: { statusCode: number; message: string; error: string }
      }

      const result$ = filter.catch(validationError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 400,
            message: 'Email must be a valid email address',
            error: 'Bad Request',
          })
          done()
        },
      })
    })

    it('should handle BadRequestException with array of messages', (done) => {
      const validationError = {
        name: 'BadRequestException',
        message: 'Validation failed',
        status: 400,
        response: {
          statusCode: 400,
          message: ['Email must be valid', 'Password is too short'],
          error: 'Bad Request',
        },
      } as Error & {
        status: number
        response: { statusCode: number; message: string[]; error: string }
      }

      const result$ = filter.catch(validationError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 400,
            message: 'Email must be valid, Password is too short',
            error: 'Bad Request',
          })
          done()
        },
      })
    })

    it('should handle validation error with statusCode property', (done) => {
      const validationError = {
        name: 'ValidationError',
        message: 'Invalid input',
        statusCode: 400,
      } as Error & { statusCode: number }

      const result$ = filter.catch(validationError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 400,
            message: 'Invalid input',
            error: 'Bad Request',
          })
          done()
        },
      })
    })

    it('should handle validation error with message object containing array', (done) => {
      const validationError = {
        name: 'ValidationError',
        message: {
          message: [
            'Username is required',
            'Username must be at least 3 characters',
          ],
        },
        status: 400,
      } as Error & {
        message: { message: string[] }
        status: number
      }

      const result$ = filter.catch(validationError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 400,
            message:
              'Username is required, Username must be at least 3 characters',
            error: 'Bad Request',
          })
          done()
        },
      })
    })
  })

  describe('Generic Errors', () => {
    it('should handle generic error with message', (done) => {
      const genericError = {
        name: 'Error',
        message: 'Something went wrong',
      } as Error

      const result$ = filter.catch(genericError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 500,
            message: 'Something went wrong',
            error: 'Internal Server Error',
          })
          done()
        },
      })
    })

    it('should handle error without message', (done) => {
      const errorWithoutMessage = {
        name: 'Error',
      } as Error

      const result$ = filter.catch(errorWithoutMessage, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 500,
            message: 'Internal server error',
            error: 'Internal Server Error',
          })
          done()
        },
      })
    })

    it('should handle error with empty message', (done) => {
      const errorWithEmptyMessage = {
        name: 'Error',
        message: '',
      } as Error

      const result$ = filter.catch(errorWithEmptyMessage, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 500,
            message: 'Internal server error',
            error: 'Internal Server Error',
          })
          done()
        },
      })
    })
  })

  describe('Edge Cases', () => {
    it('should prioritize database error over other error types', (done) => {
      const mixedError = {
        name: 'Error',
        message: 'User not found - duplicate key violation',
        code: '23505',
      } as Error & { code: string }

      const result$ = filter.catch(mixedError, mockArgumentsHost)

      result$.subscribe({
        error: (error: RpcException) => {
          expect(error).toBeInstanceOf(RpcException)
          expect(error.getError()).toEqual({
            statusCode: 409,
            message: 'Email or username already exists',
            error: 'Conflict',
          })
          done()
        },
      })
    })

    it('should return Observable that throws error', () => {
      const testError = {
        name: 'Error',
        message: 'Test error',
      } as Error

      const result$ = filter.catch(testError, mockArgumentsHost)

      expect(result$).toBeDefined()
      expect(typeof result$.subscribe).toBe('function')
    })
  })
})
