import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateBlogDto {
  @Length(1, 15)
  @IsNotEmpty()
  @IsString()
  name: string;
  @Length(1, 500)
  @IsString({
    message: 'value must be a string',
  })
  description: string;
  @Length(1, 100)
  @IsUrl()
  websiteUrl: string;
}
