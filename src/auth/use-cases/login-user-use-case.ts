import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DeviceSessions } from '@prisma/client';
import { SecurityDevicesSQLRepository } from '../../security-devices/repositories/security.devices.sql.repository';
import { AuthService } from '../auth.service';

export class LoginUserCommand {
  constructor(
    public loginDto: LoginDto,
    public ip: string,
    public userAgent: string,
  ) {}
}
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
    private readonly authService: AuthService,
  ) {}
  async execute(command: LoginUserCommand) {
    // find user and check if its banned
    const user = await this.usersSQLRepository.findUserByLoginOrEmail(
      command.loginDto.loginOrEmail,
    );
    if (!user) throw new UnauthorizedException();
    const check = await bcrypt.compare(command.loginDto.password, user.hash);
    if (!check) throw new UnauthorizedException();
    if (user.banInfo?.isBanned)
      throw new UnauthorizedException('You have been banned');

    // tokens
    const deviceId = randomUUID();
    const tokens = await this.authService.getTokens(
      user.id,
      user.login,
      deviceId,
    );
    const issuedAt = await this.authService.getIssuedAtFromRefreshToken(
      tokens.refreshToken,
    );
    // generate device session

    const deviceInfo: Omit<DeviceSessions, 'id'> = {
      ip: command.ip,
      deviceName: command.userAgent,
      lastActiveDate: issuedAt,
      deviceId,
      userId: user.id,
    };
    await this.securityDevicesSQLRepository.createNewSession(deviceInfo);
    return tokens;
  }
}
