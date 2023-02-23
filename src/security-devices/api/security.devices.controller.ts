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
import { SecurityDevicesQueryRepository } from '../security.devices.query.repository';
import { SessionViewModel } from '../index';
import { AuthGuard } from '@nestjs/passport';
import { SecurityDevicesService } from '../security.devices.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly securityDevicesService: SecurityDevicesService,
  ) {}
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get()
  async getAllDevicesForUserId(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ): Promise<SessionViewModel[]> {
    return this.securityDevicesQueryRepository.findAllActiveSessions(
      user.userId,
    );
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ) {
    return this.securityDevicesService.logoutDevices(
      user.userId,
      user.deviceId,
    );
  }
  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @GetJwtRtPayloadDecorator() user: JwtRtPayload,
  ): Promise<boolean> {
    return this.securityDevicesService.logoutDevice(
      user.userId,
      deviceId,
      user.iat,
    );
  }
}
