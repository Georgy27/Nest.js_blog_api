import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SecurityDevicesDocument = HydratedDocument<SecurityDevices>;

@Schema({ versionKey: false })
export class SecurityDevices {
  @Prop({ required: true, type: String })
  ip: string;
  @Prop({ required: true, type: String })
  deviceName: string;
  @Prop({ required: true, type: String })
  lastActiveDate: string;
  @Prop({ required: true, type: String })
  deviceId: string;
  @Prop({ required: true, type: String })
  userId: string;
}
export const SecurityDevicesSchema =
  SchemaFactory.createForClass(SecurityDevices);
