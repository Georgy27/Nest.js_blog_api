import { IsString, Length } from 'class-validator';

export class LoginDto {
  loginOrEmail: string;
  @Length(6, 20)
  @IsString()
  password: string;
}
