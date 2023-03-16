import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UsersSQLRepository } from '../repositories/PostgreSQL/users.sql.repository';
import { BadRequestException } from '@nestjs/common';
import { UserViewModel } from '../types/user.view.model';

export class CreateUserByAdminCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(private readonly usersSQLRepository: UsersSQLRepository) {}
  async execute(command: CreateUserByAdminCommand): Promise<UserViewModel> {
    const { password, login, email } = command.createUserDto;
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
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
    return this.usersSQLRepository.createUser(
      command.createUserDto,
      passwordHash,
    );
  }
}
