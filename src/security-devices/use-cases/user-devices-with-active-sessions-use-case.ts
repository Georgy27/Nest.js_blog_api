import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesSQLQueryRepository } from '../repositories/security.devices.sql.query.repository';
import { JwtRtPayload } from '../../auth/strategies';

export class ActiveUserDevicesCommand {
  constructor(public user: JwtRtPayload) {}
}
@CommandHandler(ActiveUserDevicesCommand)
export class ActiveUserDevicesUseCase
  implements ICommandHandler<ActiveUserDevicesCommand>
{
  constructor(
    private readonly securityDevicesSQLQueryRepository: SecurityDevicesSQLQueryRepository,
  ) {}
  async execute(command: ActiveUserDevicesCommand) {
    const devices =
      await this.securityDevicesSQLQueryRepository.findAllActiveSessions(
        command.user.userId,
      );

    const newDevices = devices.map((device) => {
      return {
        ip: device.ip,
        title: device.deviceName,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      };
    });
    return newDevices;
  }
}
