import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'
import { CatchableError, MessageObject } from '../interfaces'

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<CatchableError> {
  catch(exception: CatchableError, host: ArgumentsHost): Observable<never> {
    if (
      exception.code === '23505' ||
      (typeof exception.message === 'string' &&
        exception.message?.includes('duplicate key')) ||
      (typeof exception.message === 'string' &&
        exception.message?.includes('unique constraint'))
    ) {
      return throwError(
        () =>
          new RpcException({
            statusCode: 409,
            message: 'Email or username already exists',
            error: 'Conflict',
          }),
      )
    }

    if (
      typeof exception.message === 'string' &&
      exception.message?.includes('User not found')
    ) {
      return throwError(
        () =>
          new RpcException({
            statusCode: 404,
            message: 'User not found',
            error: 'Not Found',
          }),
      )
    }

    if (
      typeof exception.message === 'string' &&
      exception.message?.includes('Invalid credentials')
    ) {
      return throwError(
        () =>
          new RpcException({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          }),
      )
    }

    if (exception.status === 400 || exception.statusCode === 400) {
      let message = 'Validation failed'

      if (exception.response?.message) {
        message = Array.isArray(exception.response.message)
          ? exception.response.message.join(', ')
          : exception.response.message
      } else if (this.isMessageObject(exception.message)) {
        message = exception.message.message.join(', ')
      } else if (typeof exception.message === 'string') {
        message = exception.message
      }

      return throwError(
        () =>
          new RpcException({
            statusCode: 400,
            message,
            error: 'Bad Request',
          }),
      )
    }

    const errorMessage = this.getErrorMessage(exception.message)

    return throwError(
      () =>
        new RpcException({
          statusCode: 500,
          message: errorMessage,
          error: 'Internal Server Error',
        }),
    )
  }

  /**
   * Type guard to check if message is a MessageObject
   */
  private isMessageObject(
    message: string | MessageObject | undefined,
  ): message is MessageObject {
    return (
      typeof message === 'object' &&
      message !== null &&
      'message' in message &&
      Array.isArray(message.message)
    )
  }

  /**
   * Extract error message with fallback
   */
  private getErrorMessage(message: string | MessageObject | undefined): string {
    if (typeof message === 'string' && message.trim() !== '') {
      return message
    }
    return 'Internal server error'
  }
}
