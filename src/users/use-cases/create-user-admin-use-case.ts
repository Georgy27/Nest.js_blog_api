import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../dto/create.user.dto';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class CreateUserByAdminCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: CreateUserByAdminCommand): Promise<string> {
    const { password, login, email } = command.createUserDto;
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
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
    const preparedUser = await this.prepareUser(
      command.createUserDto,
      passwordHash,
    );
    const newUser = await this.usersRepository.createUser(preparedUser);
    return newUser.id;
  }
  async prepareUser(user: CreateUserDto, passwordHash: string): Promise<User> {
    return {
      id: randomUUID(),
      accountData: {
        login: user.login,
        email: user.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 1,
        }).toISOString(),
        isConfirmed: false,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
}
