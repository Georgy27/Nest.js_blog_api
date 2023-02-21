import { IsString, Length, Validate } from 'class-validator';
import { BlogIsExistValidator } from '../../common/decorators/validation/blogId-validation.decorator';

export class UpdatePostDto {
  @Length(1, 30)
  @IsString()
  title: string;
  @Length(1, 100)
  @IsString()
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  content: string;
  @Validate(BlogIsExistValidator)
  @IsString()
  blogId: string;
}
