import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { BlogIsExist } from '../../common/decorators/validation/blogId-validation.decorator';

export class BanUserByBloggerDto {
  @IsBoolean()
  isBanned: boolean;
  @Length(20)
  @IsNotEmpty()
  @IsString()
  banReason: string;
  @BlogIsExist()
  @IsString()
  blogId: string;
}
