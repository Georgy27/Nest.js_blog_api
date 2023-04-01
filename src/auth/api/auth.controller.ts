import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  NotFoundException,
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
import { ConfirmationCodeDto } from '../dto/confirmationCode.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';
import { ConfirmEmailCommand } from '../use-cases/confirm-emal-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { LoginUserCommand } from '../use-cases/login-user-use-case';
import { LogoutUserCommand } from '../use-cases/logout-user-use-case';
import { UsersSQLQueryRepository } from '../../users/repositories/PostgreSQL/users.sql.query.repository';
import { PasswordRecoveryCommand } from '../use-cases/user-password-recovery-use-case';
import { NewPasswordCommand } from '../use-cases/new-password-use-case';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { APIErrorResult } from '../../types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersSQLQueryRepository: UsersSQLQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('registration')
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    type: APIErrorResult,
  })
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(authDto));
  }
  @Post('registration-confirmation')
  @ApiBody({ type: ConfirmationCodeDto })
  @HttpCode(204)
  async registrationConfirmation(
    @Body() codeDto: ConfirmationCodeDto,
  ): Promise<void> {
    return this.commandBus.execute(new ConfirmEmailCommand(codeDto));
  }
  @Post('registration-email-resending')
  @ApiBody({ type: EmailDto })
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto): Promise<void> {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(emailDto),
    );
  }
  @Post('login')
  @ApiBody({ type: LoginDto })
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string }> {
    if (!userAgent) throw new UnauthorizedException();
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginUserCommand(loginDto, ip, userAgent),
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
    await this.commandBus.execute(new LogoutUserCommand(userId, deviceId));
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
  @ApiBody({ type: EmailDto })
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto): Promise<void> {
    return this.commandBus.execute(new PasswordRecoveryCommand(emailDto));
  }
  @Post('new-password')
  @ApiBody({ type: NewPasswordDto })
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto): Promise<void> {
    return this.commandBus.execute(new NewPasswordCommand(newPasswordDto));
  }
  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload) {
    const user = await this.usersSQLQueryRepository.findUser(
      jwtAtPayload.userId,
    );
    if (!user) throw new NotFoundException('user is not found');
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
