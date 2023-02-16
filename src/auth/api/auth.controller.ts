import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtRtPayload } from '../strategies';
import { GetJwtPayloadDecorator } from '../../common/decorators/getJwtPayload.decorator';

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
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string }> {
    if (!userAgent) throw new UnauthorizedException();
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto,
      ip,
      userAgent,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  @HttpCode(204)
  async logout(
    @GetJwtPayloadDecorator() user: JwtRtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, deviceId, iat } = user;
    const logoutUser = await this.authService.logout(userId, deviceId, iat);
    return res.clearCookie('refreshToken');
  }
}
