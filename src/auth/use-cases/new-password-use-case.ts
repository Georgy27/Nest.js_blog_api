import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { MailService } from '../../mail/mail.service';
import { NewPasswordDto } from '../dto/new-password.dto';
import { BadRequestException } from '@nestjs/common';
import { UserWithPasswordRecoveryInfo } from '../types';
import * as bcrypt from 'bcrypt';
export class NewPasswordCommand {
  constructor(public newPasswordDto: NewPasswordDto) {}
}
@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: NewPasswordCommand) {
    // check if user exists
    const user = await this.usersSQLRepository.findUserByPasswordRecoveryCode(
      command.newPasswordDto.recoveryCode,
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
    const passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      passwordSalt,
    );
    // update user password hash in db
    await this.usersSQLRepository.updateUserHash(user.id, passwordHash);
    // set recoveryCode and expirationCode to null
    await this.usersSQLRepository.clearRecoveryAndExpirationDate(user.id);
  }
  checkPasswordRecoveryCode(user: UserWithPasswordRecoveryInfo) {
    if (!user.passwordRecovery?.expirationDate)
      throw new BadRequestException([
        {
          message: 'User does not has an expiration date',
          field: 'recoveryCode',
        },
      ]);
    if (new Date().toISOString() > user.passwordRecovery.expirationDate)
      throw new BadRequestException([
        {
          message: 'Recovery code has expired',
          field: 'recoveryCode',
        },
      ]);
    return true;
  }
}
