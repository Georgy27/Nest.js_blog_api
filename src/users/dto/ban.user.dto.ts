import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;
  @Length(20)
  @IsNotEmpty()
  @IsString()
  banReason: string;
}
