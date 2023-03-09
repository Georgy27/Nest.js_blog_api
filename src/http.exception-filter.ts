import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    if (status === 400) {
      const errorsResponse: {
        errorsMessages: { message: string; field: string }[];
      } = {
        errorsMessages: [],
      };

      const responseBody = exception.getResponse() as null | {
        message: { message: string; field: string }[];
      };
      // if custom 400 without body
      if (!responseBody) {
        throw new Error('Bad request. Error is of wrong type.');
      }

      responseBody.message.forEach((m) =>
        errorsResponse.errorsMessages.push(m),
      );
      return response.status(status).json(errorsResponse);
    }
    if (status === 401) {
      return response.status(status).send(exception.message);
    }
    if (status === 403) {
      return response.status(status).send(exception.message);
    }
    if (status === 429) {
      return response.status(status).send(exception.message);
    }
    if (status === 404) {
      return response.status(status).send(exception.message);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
