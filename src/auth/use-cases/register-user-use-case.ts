import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthDto } from '../dto/auth.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserTransaction } from '../../users/transactions/create-user.transaction';

export class RegisterUserCommand {
  constructor(public authDto: AuthDto) {}
}
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private mailService: MailService,
    private readonly createUserTransaction: CreateUserTransaction,
  ) {}
  async execute(command: RegisterUserCommand) {
    const { login, email, password } = command.authDto;

    // check that user with the given login or email does not exist
    const checkUserLogin = await this.usersSQLRepository.findUserByLogin(login);

    if (checkUserLogin)
      throw new BadRequestException([
        { message: 'This login already exists', field: 'login' },
      ]);

    const checkUserEmail = await this.usersSQLRepository.findUserByEmail(email);
    if (checkUserEmail)
      throw new BadRequestException([
        { message: 'This email already exists', field: 'email' },
      ]);

    const passwordSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, passwordSalt);

    const newUser = await this.createUserTransaction.run({
      login,
      email,
      hash,
    });
    console.log(newUser);

    return newUser;

    // const emailConfirmation =
    //   await this.usersSQLRepository.getEmailConfirmationCode(newUser.email);
    // if (!emailConfirmation)
    //   throw new NotFoundException('confirmation code does not exist');
    // // send email
    // try {
    //   this.mailService.sendUserConfirmation(
    //     newUser,
    //     emailConfirmation.confirmationCode,
    //   );
    //   return;
    // } catch (error) {
    //   console.log(error);
    // }
  }
}
