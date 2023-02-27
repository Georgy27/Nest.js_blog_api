import { IsString, Length } from 'class-validator';

export class UpdatePostForBloggerDto {
  @Length(1, 30)
  @IsString()
  title: string;
  @Length(1, 100)
  @IsString()
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  content: string;
}
