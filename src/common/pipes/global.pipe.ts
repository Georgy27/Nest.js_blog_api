import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { TrimPipe } from "./trim.pipe";
import { ValidationError } from "class-validator";
import { prepareErrorResult } from "./validation.pipe";

export function useGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        throw new BadRequestException(prepareErrorResult(errors));
      },
    }),
  );
}
