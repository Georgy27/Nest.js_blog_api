import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtRtPayload } from '../../auth/strategies';
import { SecurityDevicesSQLRepository } from '../repositories/security.devices.sql.repository';

export class DeleteAllSessionsButActiveCommand {
  constructor(public user: JwtRtPayload) {}
}
@CommandHandler(DeleteAllSessionsButActiveCommand)
export class DeleteAllSessionsButActiveUseCase
  implements ICommandHandler<DeleteAllSessionsButActiveCommand>
{
  constructor(
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
  ) {}
  async execute(command: DeleteAllSessionsButActiveCommand) {
    await this.securityDevicesSQLRepository.deleteAllSessionsExceptCurrent(
      command.user.userId,
      command.user.deviceId,
    );
  }
}
