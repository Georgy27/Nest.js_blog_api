import { Injectable } from '@nestjs/common';
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
}
