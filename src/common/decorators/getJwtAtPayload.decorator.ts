import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAtPayload } from '../../auth/strategies';

export const GetJwtAtPayloadDecorator = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtAtPayload => {
    const request = context.switchToHttp().getRequest();
    const user: JwtAtPayload = request.user;
    return user;
  },
);
