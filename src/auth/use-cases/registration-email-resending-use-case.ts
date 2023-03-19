import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { EmailDto } from '../dto/email.dto';
import { BadRequestException } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';

export class RegistrationEmailResendingCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    // find user
    const user = await this.usersSQLRepository.findUserByEmail(
      command.emailDto.email,
    );
    if (!user)
      throw new BadRequestException([
        {
          message: 'No user exists with the given email',
          field: 'email',
        },
      ]);
    // check if user is already confirmed
    const checkEmailConfirmation =
      await this.usersSQLRepository.getEmailConfirmationCode(user.email);
    if (checkEmailConfirmation?.isConfirmed)
      throw new BadRequestException([
        {
          message: 'User already confirmed',
          field: 'email',
        },
      ]);
    // update email confirmation info
    const emailConfirmationInfo =
      await this.usersSQLRepository.updateEmailConfirmationInfo(user.email);

    try {
      await this.mailService.sendUserConfirmation(
        user,
        emailConfirmationInfo.confirmationCode,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
