import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { IBannedUsersInfo, IBlogOwnerInfo } from './index';
export type BlogDocument = HydratedDocument<Blog>;

@Schema({ id: false, versionKey: false })
export class Blog {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  name: string;
  @Prop({ required: true, type: String })
  description: string;
  @Prop({ required: true, type: String })
  websiteUrl: string;
  @Prop({ required: true, type: String })
  createdAt: string;
  @Prop({ required: true, type: Boolean })
  isMembership: boolean;
  @Prop(
    raw({
      userId: { required: true, type: String },
      userLogin: { required: true, type: String },
    }),
  )
  blogOwnerInfo: IBlogOwnerInfo;
  @Prop(
    raw([
      {
        id: { unique: true, type: String },
        login: { unique: true, type: String },
        banInfo: raw({
          isBanned: { type: Boolean },
          banDate: { type: String },
          banReason: { type: String },
        }),
      },
    ]),
  )
  bannedUsersInfo: IBannedUsersInfo[];
  @Prop({ required: true, default: false, type: Boolean })
  isBanned: boolean;

  createBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
  ) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
    this.blogOwnerInfo.userId = userId;
    this.blogOwnerInfo.userLogin = userLogin;
    this.bannedUsersInfo = [];
    this.isBanned = false;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  createBlog: Blog.prototype.createBlog,
};
