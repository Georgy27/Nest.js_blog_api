import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { reactionStatusEnum, reactionStatusEnumKeys } from './index';

export type ReactionDocument = HydratedDocument<Reaction>;

@Schema({ versionKey: false })
export class Reaction {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  parentType: string;
  @Prop({ required: true, type: String })
  parentId: string;
  @Prop({ required: true, type: String, enum: reactionStatusEnum })
  status: reactionStatusEnumKeys;
  @Prop({ required: true, type: String })
  addedAt: string;
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  userLogin: string;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
