import { ApiProperty } from '@nestjs/swagger';
export class FieldError {
  @ApiProperty()
  message: string;
  @ApiProperty()
  field: string;
}
export class APIErrorResult {
  @ApiProperty({
    name: 'errorMessages',
    type: [FieldError],
  })
  errorsMessages: [
    {
      message: string;
      field: string;
    },
  ];
}
