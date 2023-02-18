import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const session = await this.securityDevicesRepository.findSessionByDeviceId(
      userId,
      deviceId,
    );
    if (!session) throw new UnauthorizedException();
    session.lastActiveDate = lastActiveDate;
    return this.securityDevicesRepository.save(session);
  }
}
