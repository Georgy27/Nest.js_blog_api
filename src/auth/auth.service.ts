import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesService } from '../security-devices/security.devices.service';
import { ConfigService } from '@nestjs/config';
import { SecurityDevicesRepository } from '../security-devices/repositories/security.devices.repository';
import * as bcrypt from 'bcrypt';
import { UsersSQLRepository } from '../users/repositories/PostgreSQL/users.sql.repository';
import { UsersRepository } from '../users/repositories/mongo/users.repository';
import { SecurityDevicesSQLRepository } from '../security-devices/repositories/security.devices.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly usersRepository: UsersRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
    private mailService: MailService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async refreshTokin(
    userId: string,
    userLogin: string,
    deviceId: string,
    iat: number,
  ) {
    // // check if the token is valid
    // const lastActiveDate = new Date(iat * 1000).toISOString();
    // const isSession =
    //   await this.securityDevicesSQLRepository.findSessionByDeviceId(deviceId);
    // if (!isSession) throw new UnauthorizedException();
    // if (isSession.lastActiveDate !== lastActiveDate)
    //   throw new UnauthorizedException();
    //  create new pair of tokens
    const tokens = await this.getTokens(userId, userLogin, deviceId);
    const issuedAt = await this.getIssuedAtFromRefreshToken(
      tokens.refreshToken,
    );
    await this.securityDevicesSQLRepository.updateLastActiveDate(
      deviceId,
      issuedAt,
    );
    return tokens;
  }

  async getTokens(userId: string, userLogin: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId, userLogin, deviceId },
        {
          secret: this.config.get<string>('JWT_AT_SECRET'),
          expiresIn: '10hours',
          // expiresIn: '9s',
        },
      ),
      this.jwtService.signAsync(
        { userId, userLogin, deviceId },
        {
          secret: this.config.get<string>('JWT_RT_SECRET'),
          expiresIn: '24hours',
          // expiresIn: '19s',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getIssuedAtFromRefreshToken(refreshToken: string) {
    const decodedToken: any = await this.jwtService.decode(refreshToken);
    const issuedAt = new Date(decodedToken.iat * 1000).toISOString();
    return issuedAt;
  }
}
