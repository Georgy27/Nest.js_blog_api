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
import { UsersQueryRepository } from '../../users/repositories/mongo/users.query.repository';
import { ConfirmationCodeDto } from '../dto/confirmationCode.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';
import { ConfirmEmailCommand } from '../use-cases/confirm-emal-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(authDto));
  }
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() codeDto: ConfirmationCodeDto,
  ): Promise<void> {
    return this.commandBus.execute(new ConfirmEmailCommand(codeDto));
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto): Promise<void> {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(emailDto),
    );
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
  @SkipThrottle()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  @HttpCode(204)
  async logout(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { userId, deviceId } = user;
    const logoutUser = await this.authService.logout(userId, deviceId);
    res.clearCookie('refreshToken');
  }
  @SkipThrottle()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { userId, userLogin, deviceId, iat } = user;
    const { accessToken, refreshToken } = await this.authService.refreshTokin(
      userId,
      userLogin,
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
  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload) {
    const user = await this.userQueryRepository.findUser(jwtAtPayload.userId);
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
