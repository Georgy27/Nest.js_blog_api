import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto): Promise<void> {
    return this.authService.registration(authDto);
  }
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() code: string): Promise<void> {
    return this.authService.confirmEmail(code);
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() email: string): Promise<void> {
    return this.authService.resendEmail(email);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto) {}
}
