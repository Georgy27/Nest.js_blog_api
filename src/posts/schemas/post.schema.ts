import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreatePostDto } from '../dto/create.post.dto';
import { randomUUID } from 'crypto';
import { UpdatePostDto } from '../dto/update.post.dto';
import { UpdatePostForBloggerDto } from '../../blogs/dto/update.post.blogger.dto';

export type PostDocument = HydratedDocument<Post>;

@Schema({ id: false, versionKey: false })
export class Post {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  title: string;
  @Prop({ required: true, type: String })
  shortDescription: string;
  @Prop({ required: true, type: String })
  content: string;
  @Prop({ required: true, type: String })
  blogId: string;
  @Prop({ required: true, type: String })
  blogName: string;
  @Prop({ required: true, type: String })
  createdAt: string;
  @Prop({ required: true, type: String })
  userId: string;
  @Prop({ required: true, type: Boolean, default: false })
  isUserBanned: boolean;

  createPost(createPostDto: CreatePostDto, blogName: string, userId: string) {
    this.id = randomUUID();
    this.title = createPostDto.title;
    this.shortDescription = createPostDto.shortDescription;
    this.content = createPostDto.content;
    this.blogId = createPostDto.blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
    this.userId = userId;
  }
  updatePost(updatePostDto: UpdatePostForBloggerDto) {
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
    this.content = updatePostDto.content;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  createPost: Post.prototype.createPost,
  updatePost: Post.prototype.updatePost,
};
