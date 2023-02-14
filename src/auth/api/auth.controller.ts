import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto) {
    return this.authService.registration(authDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {}
  @Post('registration-confirmation')
  async registrationConfirmation() {}
}
