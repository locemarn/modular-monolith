import { status } from '@grpc/grpc-js'
import { RpcException } from '@nestjs/microservices'

export class UnauthorizedException extends RpcException {
  constructor(message: string = 'Unauthorized') {
    super({
      code: status.UNAUTHENTICATED,
      message,
      details: message,
    })
  }
}
