import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanBlogAdminDto {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
}
