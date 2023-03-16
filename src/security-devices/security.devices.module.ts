import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityDevicesController } from './api/security.devices.controller';
import { SecurityDevicesService } from './security.devices.service';
import { SecurityDevicesRepository } from './repositories/security.devices.repository';
import { SecurityDevicesQueryRepository } from './repositories/security.devices.query.repository';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './schemas/security.devices.schema';
import { SecurityDevicesSQLRepository } from './repositories/security.devices.sql.repository';
import { SecurityDevicesSQLQueryRepository } from './repositories/security.devices.sql.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityDevices.name, schema: SecurityDevicesSchema },
    ]),
  ],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesService,
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,
    SecurityDevicesSQLRepository,
    SecurityDevicesSQLQueryRepository,
  ],
  exports: [
    SecurityDevicesService,
    SecurityDevicesRepository,
    SecurityDevicesSQLRepository,
    SecurityDevicesSQLQueryRepository,
  ],
})
export class SecurityDevicesModule {}
