import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRtPayload } from '../../auth/strategies';

export const GetJwtPayloadDecorator = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtRtPayload => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtRtPayload;
    return user;
  },
);
