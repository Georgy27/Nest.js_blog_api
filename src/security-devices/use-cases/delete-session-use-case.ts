import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtRtPayload } from '../../auth/strategies';
import { SecurityDevicesSQLRepository } from '../repositories/security.devices.sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteSessionCommand {
  constructor(public user: JwtRtPayload, public deviceId: string) {}
}
@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
  ) {}
  async execute(command: DeleteSessionCommand) {
    const isSession =
      await this.securityDevicesSQLRepository.findSessionByDeviceId(
        command.deviceId,
      );
    if (!isSession) throw new NotFoundException();
    if (isSession.userId !== command.user.userId)
      throw new ForbiddenException();
    await this.securityDevicesSQLRepository.deleteSessionByDeviceId(
      command.deviceId,
    );
  }
}
