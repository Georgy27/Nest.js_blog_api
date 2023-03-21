import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetJwtRtPayloadDecorator } from '../../common/decorators/getJwtRtPayload.decorator';
import { JwtRtPayload } from '../../auth/strategies';
import { SecurityDevicesQueryRepository } from '../repositories/security.devices.query.repository';
import { SessionViewModel } from '../index';
import { AuthGuard } from '@nestjs/passport';
import { SecurityDevicesService } from '../security.devices.service';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { ActiveUserDevicesCommand } from '../use-cases/user-devices-with-active-sessions-use-case';
import { DeleteAllSessionsButActiveCommand } from '../use-cases/delete-all-sessions-but-active-use-case';
import { DeleteSessionCommand } from '../use-cases/delete-session-use-case';

@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get()
  async getAllDevicesForUserId(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ): Promise<SessionViewModel[]> {
    return this.commandBus.execute(new ActiveUserDevicesCommand(user));
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteAllSessionsButActiveCommand(user));
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteSessionCommand(user, deviceId));
  }
}
