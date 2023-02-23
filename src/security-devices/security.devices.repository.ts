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

  async save(session: SecurityDevicesDocument): Promise<string> {
    await session.save();
    return session.deviceId;
  }

  async createNewSession(
    deviceInfo: SecurityDevices,
  ): Promise<SecurityDevices> {
    return this.securityDevicesModel.create({ ...deviceInfo });
  }

  async deleteSessionByDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const deletedToken = await this.securityDevicesModel.deleteOne({
      userId,
      deviceId,
    });
    console.log(deletedToken);
    return deletedToken.deletedCount === 1;
  }

  async findLastActiveDate(
    userId: string,
    lastActiveDate: string,
  ): Promise<SecurityDevices | null> {
    return this.securityDevicesModel.findOne({ userId, lastActiveDate }).lean();
  }

  async findSessionByDeviceAndUserId(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.securityDevicesModel.findOne({ userId, deviceId });
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.securityDevicesModel.findOne({ deviceId });
  }

  async deleteAllSessionsExceptCurrent(userId: string, deviceId: string) {
    return this.securityDevicesModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
  async clearSessions() {
    await this.securityDevicesModel.deleteMany({});
  }
}
