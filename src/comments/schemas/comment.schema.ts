import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class CommentatorInfo {
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: String })
  userLogin: string;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

// @Schema({ _id: false, versionKey: false })
// export class LikesInfo {
//   @Prop({ required: true, type: Number })
//   likesCount: number;
//   @Prop({ required: true, type: Number })
//   dislikesCount: number;
//   @Prop({ required: true, type: String })
//   myStatus: string;
// }
// export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

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
  // @Prop({ required: true, type: LikesInfoSchema })
  // likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
