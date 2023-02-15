import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private mailService: MailService,
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
}
