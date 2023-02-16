import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityDevicesController } from './api/security.devices.controller';
import { SecurityDevicesService } from './security.devices.service';
import { SecurityDevicesRepository } from './security.devices.repository';
import { SecurityDevicesQueryRepository } from './security.devices.query.repository';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './schemas/security.devices.schema';

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
  ],
  exports: [SecurityDevicesService, SecurityDevicesRepository],
})
export class SecurityDevicesModule {}
