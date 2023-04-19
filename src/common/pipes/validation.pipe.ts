import { ValidationError } from 'class-validator';

export const prepareErrorResult = (errors: ValidationError[]) => {
  const errorsForResponse: { message: string; field: string }[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      const constraintsKeys = Object.keys(error.constraints);
      return errorsForResponse.push({
        message: error.constraints[constraintsKeys[0]],
        field: error.property,
      });
    }
    throw new Error('unknown server error');
  });
  return errorsForResponse;
};
