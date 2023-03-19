import { Injectable } from '@nestjs/common';
import {
  SecurityDevices,
  SecurityDevicesDocument,
} from '../schemas/security.devices.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceSessions } from '@prisma/client';

@Injectable()
export class SecurityDevicesSQLRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevicesDocument>,
    private prisma: PrismaService,
  ) {}

  async save(session: SecurityDevicesDocument): Promise<string> {
    await session.save();
    return session.deviceId;
  }

  async createNewSession(deviceInfo: SecurityDevices) {
    // return this.prisma.deviceSessions.upsert({
    //   create: deviceInfo,
    //   update: {
    //     ip: deviceInfo.ip,
    //     lastActiveDate: deviceInfo.lastActiveDate,
    //   },
    //   where: {
    //     deviceName:deviceName
    //   },
    // });
    return this.prisma.deviceSessions.create({ data: deviceInfo });
  }
  async deleteSessionByDeviceId(deviceId: string) {
    return this.prisma.deviceSessions.delete({ where: { deviceId } });
  }

  async findLastActiveDate(deviceId: string): Promise<DeviceSessions | null> {
    return this.prisma.deviceSessions.findUnique({
      where: { deviceId },
    });
  }

  async findSessionByDeviceAndUserId(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.securityDevicesModel.findOne({ userId, deviceId });
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<DeviceSessions | null> {
    return this.prisma.deviceSessions.findUnique({ where: { deviceId } });
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
  async deleteAllUserSessions(userId: string) {
    return this.prisma.deviceSessions.deleteMany({ where: { userId: userId } });
  }
}
