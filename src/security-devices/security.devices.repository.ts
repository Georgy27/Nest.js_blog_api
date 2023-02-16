import { Injectable } from '@nestjs/common';
import {
  SecurityDevices,
  SecurityDevicesDocument,
} from './schemas/security.devices.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevicesDocument>,
  ) {}
  async createNewSession(
    deviceInfo: SecurityDevices,
  ): Promise<SecurityDevices> {
    return this.securityDevicesModel.create({ ...deviceInfo });
  }
  async deleteSessionByDeviceId(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const deletedToken = await this.securityDevicesModel.deleteOne({
      userId,
      deviceId,
      lastActiveDate,
    });
    return deletedToken.deletedCount === 1;
  }
}
