import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;
  @Length(6, 20)
  @IsString()
  password: string;
}
