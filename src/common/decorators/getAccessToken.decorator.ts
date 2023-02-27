import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetPayloadFromAt = createParamDecorator(
  (_: undefined, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    return request.user.userId;
  },
);
