import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../types/request-with-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user; // ini berasal dari JwtStrategy.validate()
  },
);
