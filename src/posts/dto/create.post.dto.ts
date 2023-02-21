import { IsString, Length, Validate } from 'class-validator';
import { BlogIsExistRule } from '../../common/decorators/blogId-validation.decorator';

export class CreatePostDto {
  @IsString()
  @Length(1, 30)
  title: string;
  @IsString()
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Length(1, 1000)
  content: string;
  @Validate(BlogIsExistRule)
  @IsString()
  blogId: string;
}
