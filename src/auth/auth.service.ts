import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';
import { SecurityDevices } from '../security-devices/schemas/security.devices.schema';
import { SecurityDevicesService } from '../security-devices/security.devices.service';
import { ConfigService } from '@nestjs/config';
import { SecurityDevicesRepository } from '../security-devices/security.devices.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private mailService: MailService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async registration(user: AuthDto) {
    const { login, email } = user;
    // check that user with the given login or email does not exist
    const checkUserLogin = await this.usersRepository.findUserByLogin(login);
    if (checkUserLogin)
      throw new BadRequestException([
        { message: 'This login already exists', field: 'login' },
      ]);
    const checkUserEmail = await this.usersRepository.findUserByEmail(email);
    if (checkUserEmail)
      throw new BadRequestException([
        { message: 'This email already exists', field: 'email' },
      ]);
    // create user
    const newUser: User = await this.usersService.createUser(user);
    // send email
    try {
      return this.mailService.sendUserConfirmation(
        newUser,
        newUser.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.log(error);
    }
  }
  async login(
    loginDto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.validateUserByLoginOrEmail(
      loginDto.loginOrEmail,
      loginDto.password,
    );
    const deviceId = randomUUID();
    const tokens = await this.getTokens(user.id, deviceId);
    const issuedAt = await this.getIssuedAtFromRefreshToken(
      tokens.refreshToken,
    );
    const deviceInfo: SecurityDevices = {
      ip,
      deviceName: userAgent,
      lastActiveDate: issuedAt,
      deviceId,
      userId: user.id,
    };
    await this.securityDevicesService.createNewDevice(deviceInfo);
    return tokens;
  }
  async logout(userId: string, deviceId: string) {
    const logOutUser =
      await this.securityDevicesService.deleteSessionByDeviceId(
        userId,
        deviceId,
      );
    if (!logOutUser) throw new UnauthorizedException();

    return logOutUser;
  }
  async refreshTokin(userId: string, deviceId: string, iat: number) {
    // check if the token is valid
    const lastActiveDate = new Date(iat * 1000).toISOString();
    const isValidRt = await this.securityDevicesRepository.findLastActiveDate(
      userId,
      lastActiveDate,
    );
    if (!isValidRt) throw new UnauthorizedException();

    // if valid, create new pair of tokens
    const tokens = await this.getTokens(userId, deviceId);
    const issuedAt = await this.getIssuedAtFromRefreshToken(
      tokens.refreshToken,
    );
    await this.securityDevicesService.updateLastActiveDate(
      userId,
      deviceId,
      issuedAt,
    );
    return tokens;
  }
  async confirmEmail(code: string): Promise<void> {
    // check that user exists
    const user = await this.usersRepository.findUserByEmailConfirmationCode(
      code,
    );
    if (!user)
      throw new BadRequestException([
        {
          message: 'No user exists with the given confirmation code',
          field: 'code',
        },
      ]);
    const checkCode = this.checkUserConfirmationCode(user, code);
    if (checkCode) await this.usersService.updateConfirmation(user);
  }
  async resendEmail(email: string) {
    // find user
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user)
      throw new BadRequestException([
        {
          message: 'No user exists with the given email',
          field: 'email',
        },
      ]);
    if (user.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'User already confirmed',
          field: 'email',
        },
      ]);

    await this.usersService.updateConfirmationCode(user);

    try {
      await this.mailService.sendUserConfirmation(
        user,
        user.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return;

    const updatedUser = await this.usersService.setPasswordRecoveryCode(user);
    if (!updatedUser.passwordRecovery.recoveryCode) return;

    try {
      await this.mailService.sendUserConfirmation(
        updatedUser,
        updatedUser.passwordRecovery.recoveryCode,
      );
    } catch (error) {
      console.log(error);
    }
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
  checkUserConfirmationCode(user: User, code: string) {
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          message: 'User email already confirmed',
          field: 'code',
        },
      ]);
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      throw new BadRequestException([
        {
          message: 'User code does not match',
          field: 'code',
        },
      ]);
    }
    if (user.emailConfirmation.expirationDate < new Date().toISOString()) {
      throw new BadRequestException([
        {
          message: 'User code has expired',
          field: 'code',
        },
      ]);
    }
    return true;
  }
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
  async getTokens(userId: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId },
        {
          secret: this.config.get<string>('JWT_AT_SECRET'),
          expiresIn: 60 * 15,
          //expiresIn: '10 seconds',
        },
      ),
      this.jwtService.signAsync(
        { userId, deviceId },
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
