import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { IBannedUsersInfo, IBlogOwnerInfo } from './index';
export type BlogDocument = HydratedDocument<Blog>;

@Schema({ id: false, versionKey: false })
export class Blog {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
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
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  createBlog: Blog.prototype.createBlog,
};
