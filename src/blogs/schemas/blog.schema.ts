import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { IBlogOwnerInfo } from './index';
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
  static createBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    Blog: BlogModelType,
  ) {
    return new Blog({
      id: randomUUID(),
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: userId,
        userLogin: userLogin,
      },
    });
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};
BlogSchema.statics = blogStaticMethods;

export type BlogModelStaticType = {
  createBlog: (
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    Blog: BlogModelType,
  ) => BlogDocument;
};
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
