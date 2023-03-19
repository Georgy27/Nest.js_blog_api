import { SecurityDevicesSQLRepository } from '../../security-devices/repositories/security.devices.sql.repository';
import { AuthService } from '../auth.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class LogoutUserCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
    private readonly authService: AuthService,
  ) {}
  async execute(command: LogoutUserCommand) {
    const isDeviceSession =
      await this.securityDevicesSQLRepository.findSessionByDeviceId(
        command.deviceId,
      );

    if (!isDeviceSession)
      throw new NotFoundException('this device session does not exist');
    if (isDeviceSession.userId !== command.userId)
      throw new ForbiddenException('you are not authorized for this operation');

    return this.securityDevicesSQLRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
