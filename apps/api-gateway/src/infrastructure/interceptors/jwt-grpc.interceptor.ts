import { Metadata } from '@grpc/grpc-js'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'
import { UnauthorizedException } from '../../../../shared/exceptions/unauthorized.exception'
import { JwtPayload } from '../../../../shared/interfaces/jwt-payload.interface'

@Injectable()
export class JwtGrpcInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle()
    }

    const metadata = context.getArgByIndex<Metadata>(1)

    const authHeader = (metadata.get('authorization') ||
      metadata.get('Authorization'))?.[0]

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('No authorization token provided')
    }

    const token = authHeader.replace('Bearer ', '').trim()

    try {
      const payload = this.jwtService.verify<JwtPayload>(token)
      metadata.set('user', JSON.stringify(payload))
      return next.handle()
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
