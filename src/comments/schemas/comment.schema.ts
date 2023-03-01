import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IBanInfo } from '../../users/schemas';

@Schema({ _id: false, versionKey: false })
export class CommentatorInfo {
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  userLogin: string;
  @Prop({ required: true, type: Boolean, default: false })
  isUserBanned: boolean;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ id: false, versionKey: false })
export class Comment {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  postId: string;
  @Prop({ required: true, type: String })
  content: string;
  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true, type: String })
  createdAt: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
