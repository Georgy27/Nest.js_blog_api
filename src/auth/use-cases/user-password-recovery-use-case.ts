import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { EmailDto } from '../dto/email.dto';
import { BadRequestException } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class PasswordRecoveryCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const user = await this.usersSQLRepository.findUserByEmail(
      command.emailDto.email,
    );
    if (!user) return;
    const updatedPasswordRecovery =
      await this.usersSQLRepository.updatePasswordRecoveryInfo(user.id);
    if (!updatedPasswordRecovery.recoveryCode) return;
    try {
      await this.mailService.sendUserConfirmation(
        user,
        updatedPasswordRecovery.recoveryCode,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
