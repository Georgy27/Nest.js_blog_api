import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { ConfirmationCodeDto } from '../dto/confirmationCode.dto';
import { BadRequestException } from '@nestjs/common';
import { UserWithEmailConfirmation } from '../types';

export class ConfirmEmailCommand {
  constructor(public codeDto: ConfirmationCodeDto) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersSQLRepository: UsersSQLRepository) {}

  async execute(command: ConfirmEmailCommand) {
    // check user
    const user = await this.usersSQLRepository.findUserByEmailConfirmationCode(
      command.codeDto.code,
    );

    if (!user)
      throw new BadRequestException([
        {
          message: 'No user exists with the given confirmation code',
          field: 'code',
        },
      ]);

    const checkCode = this.checkUserConfirmationCode(
      user,
      command.codeDto.code,
    );
    if (checkCode)
      await this.usersSQLRepository.updateEmailConfirmationCode(user.email);
  }
  checkUserConfirmationCode(user: UserWithEmailConfirmation, code: string) {
    if (!user.emailConfirmation)
      throw new BadRequestException([
        {
          message: 'No email confirmation exists for the current user',
          field: 'emailConfirmation',
        },
      ]);
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
