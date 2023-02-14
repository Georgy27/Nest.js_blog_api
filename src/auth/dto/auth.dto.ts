import { IsEmail, IsString, Length } from 'class-validator';

export class AuthDto {
  @Length(3, 10)
  @IsString()
  login: string;
  @Length(6, 20)
  @IsString()
  password: string;
  @IsEmail()
  email: string;
}
