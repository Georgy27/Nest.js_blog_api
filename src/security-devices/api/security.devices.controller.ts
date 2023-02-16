import { Controller, Get } from '@nestjs/common';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor() {}
  @Get()
  async getAllDevicesForUserId() {}
}
