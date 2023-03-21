import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SecurityDevicesSQLQueryRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findAllActiveSessions(userId: string) {
    return this.prisma.deviceSessions.findMany({
      where: { userId },
      select: {
        ip: true,
        deviceName: true,
        lastActiveDate: true,
        deviceId: true,
      },
    });
  }
}
