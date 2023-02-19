import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtAtPayload, JwtRtPayload } from '../strategies';
import { GetJwtRtPayloadDecorator } from '../../common/decorators/getJwtRtPayload.decorator';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { UsersQueryRepository } from '../../users/users.query.repository';
import { ConfirmationCodeDto } from '../dto/confirmationCode.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userQueryRepository: UsersQueryRepository,
  ) {}
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto): Promise<void> {
    return this.authService.registration(authDto);
  }
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() codeDto: ConfirmationCodeDto,
  ): Promise<void> {
    return this.authService.confirmEmail(codeDto.code);
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto): Promise<void> {
    return this.authService.resendEmail(emailDto.email);
  }
  @Post('login')
  @HttpCode(200)
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
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { userId, deviceId, iat } = user;
    const logoutUser = await this.authService.logout(userId, deviceId, iat);
    res.clearCookie('refreshToken');
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  async refreshToken(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { userId, deviceId, iat } = user;
    const { accessToken, refreshToken } = await this.authService.refreshTokin(
      userId,
      deviceId,
      iat,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto): Promise<void> {
    await this.authService.passwordRecovery(emailDto.email);
  }
  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto): Promise<void> {
    await this.authService.confirmNewPassword(
      newPasswordDto.recoveryCode,
      newPasswordDto.newPassword,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@GetJwtAtPayloadDecorator() userId: string) {
    const user = await this.userQueryRepository.findUser(userId);
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
