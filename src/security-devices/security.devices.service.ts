import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityDevices } from './schemas/security.devices.schema';
import { SecurityDevicesRepository } from './security.devices.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}
  async createNewDevice(deviceInfo: SecurityDevices): Promise<SecurityDevices> {
    return this.securityDevicesRepository.createNewSession(deviceInfo);
  }
  async deleteSessionByDeviceId(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    return this.securityDevicesRepository.deleteSessionByDeviceId(
      userId,
      deviceId,
      lastActiveDate,
    );
  }
  async updateLastActiveDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<string> {
    const session =
      await this.securityDevicesRepository.findSessionByDeviceAndUserId(
        userId,
        deviceId,
      );
    if (!session) throw new UnauthorizedException();
    session.lastActiveDate = lastActiveDate;
    return this.securityDevicesRepository.save(session);
  }
  async logoutDevices(userId: string, deviceId: string) {
    return this.securityDevicesRepository.deleteAllSessionsExceptCurrent(
      userId,
      deviceId,
    );
  }
  async logoutDevice(
    userId: string,
    deviceId: string,
    iat: number,
  ): Promise<boolean> {
    const lastActiveDate = new Date(iat * 1000).toISOString();
    const isSession =
      await this.securityDevicesRepository.findSessionByDeviceId(deviceId);
    if (!isSession) throw new NotFoundException();
    if (isSession.userId !== userId) throw new ForbiddenException();
    return this.securityDevicesRepository.deleteSessionByDeviceId(
      userId,
      deviceId,
      lastActiveDate,
    );
  }
}
