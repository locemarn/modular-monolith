import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../../interfaces/jwt-payload.interface'

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | unknown => {
    const contextType = ctx.getType()

    if (contextType === 'http') {
      const request = ctx.switchToHttp().getRequest()
      const user = request.user
      return data ? user?.[data] : user
    }

    if (contextType === 'rpc') {
      const rpcContext = ctx.switchToRpc()
      const metadata = rpcContext.getContext()
      const user = metadata?.user
      return data ? user?.[data] : user
    }

    return null
  },
)
