import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

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
    // check if the token is valid
    const lastActiveDate = new Date(iat * 1000).toISOString();
    const isSession =
      await this.securityDevicesSQLRepository.findSessionByDeviceId(deviceId);
    if (!isSession) throw new UnauthorizedException();
    if (isSession.lastActiveDate !== lastActiveDate)
      throw new UnauthorizedException();
    // if valid, create new pair of tokens
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

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return;

    const updatedUser = await this.usersService.setPasswordRecoveryCode(user);
    if (!updatedUser.passwordRecovery.recoveryCode) return;

    // try {
    //   await this.mailService.sendUserConfirmation(
    //     updatedUser,
    //     updatedUser.passwordRecovery.recoveryCode,
    //   );
    // } catch (error) {
    //   console.log(error);
    // }
  }
  async confirmNewPassword(
    recoveryCode: string,
    newPassword: string,
  ): Promise<void> {
    // check if user exists
    const user = await this.usersRepository.findUserByPasswordRecoveryCode(
      recoveryCode,
    );
    if (!user)
      throw new BadRequestException([
        {
          message: 'User with the given recovery code does not exist',
          field: 'recoveryCode',
        },
      ]);
    // check if recoveryCode is valid
    const checkRecoveryCode = this.checkPasswordRecoveryCode(user);
    // prepare password
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, passwordSalt);
    // update user password hash in db
    await this.usersService.updatePasswordHash(user, passwordHash);
    // set recoveryCode and expirationCode to null
    await this.usersService.clearRecoveryCode(user);
  }
  // checkUserConfirmationCode(user: User, code: string) {
  //   if (user.emailConfirmation.isConfirmed) {
  //     throw new BadRequestException([
  //       {
  //         message: 'User email already confirmed',
  //         field: 'code',
  //       },
  //     ]);
  //   }
  //   if (user.emailConfirmation.confirmationCode !== code) {
  //     throw new BadRequestException([
  //       {
  //         message: 'User code does not match',
  //         field: 'code',
  //       },
  //     ]);
  //   }
  //   if (user.emailConfirmation.expirationDate < new Date().toISOString()) {
  //     throw new BadRequestException([
  //       {
  //         message: 'User code has expired',
  //         field: 'code',
  //       },
  //     ]);
  //   }
  //   return true;
  // }
  checkPasswordRecoveryCode(user: User) {
    if (!user.passwordRecovery.expirationDate)
      throw new BadRequestException([
        {
          message: 'User does not has an expiration date',
          field: 'recoveryCode',
        },
      ]);
    if (new Date().toISOString() > user.passwordRecovery.expirationDate)
      throw new BadRequestException([
        {
          message: 'User with the given recovery code does not exist',
          field: 'recoveryCode',
        },
      ]);
    return true;
  }
  async getTokens(userId: string, userLogin: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId, userLogin, deviceId },
        {
          secret: this.config.get<string>('JWT_AT_SECRET'),
          expiresIn: 60 * 15,
          //expiresIn: '10 seconds',
        },
      ),
      this.jwtService.signAsync(
        { userId, userLogin, deviceId },
        {
          secret: this.config.get<string>('JWT_RT_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
          // expiresIn: '20 seconds',
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
