import { IsString, IsUrl, Length } from 'class-validator';

export class CreateBlogDto {
  @Length(1, 15)
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
