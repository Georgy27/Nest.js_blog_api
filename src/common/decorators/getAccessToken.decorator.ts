import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAccessToken = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      return (request.user = null);
    }
    const token = auth.split(' ')[1];
    return (request.user = token);
  },
);
