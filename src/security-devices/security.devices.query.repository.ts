import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevices,
  SecurityDevicesDocument,
} from './schemas/security.devices.schema';
import { Model } from 'mongoose';
import { SessionViewModel } from './index';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevicesDocument>,
  ) {}
  async findAllActiveSessions(userId: string): Promise<SessionViewModel[]> {
    const devices = await this.securityDevicesModel
      .find({ userId }, { _id: false })
      .lean();
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
