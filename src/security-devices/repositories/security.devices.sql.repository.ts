import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.deviceSessions.upsert({
      create: deviceInfo,
      update: {
        ip: deviceInfo.ip,
        lastActiveDate: deviceInfo.lastActiveDate,
        deviceId: deviceInfo.deviceId,
      },
      where: { deviceName: deviceInfo.deviceName },
    });
    // return this.prisma.deviceSessions.create({ data: deviceInfo });
  }
  async deleteSessionByDeviceId(deviceId: string) {
    return this.prisma.deviceSessions.delete({ where: { deviceId } });
  }

  async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<DeviceSessions> {
    try {
      const updatedUser = await this.prisma.deviceSessions.update({
        where: { deviceId },
        data: { lastActiveDate },
      });
      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('user is not found');
    }
  }
  // async findSessionByDeviceAndUserId(
  //   userId: string,
  //   deviceId: string,
  // ): Promise<SecurityDevicesDocument | null> {
  //   return this.securityDevicesModel.findOne({ userId, deviceId });
  // }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<DeviceSessions | null> {
    return this.prisma.deviceSessions.findUnique({ where: { deviceId } });
  }

  async deleteAllSessionsExceptCurrent(userId: string, deviceId: string) {
    return this.prisma.deviceSessions.deleteMany({
      where: { userId, NOT: [{ deviceId }] },
    });
  }
  async clearSessions() {
    await this.securityDevicesModel.deleteMany({});
  }
  async deleteAllUserSessions(userId: string) {
    return this.prisma.deviceSessions.deleteMany({ where: { userId: userId } });
  }
}
