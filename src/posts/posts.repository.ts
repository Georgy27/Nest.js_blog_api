import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async save(post: PostDocument): Promise<string> {
    await post.save();
    return post.id;
  }
  async findPostById(id: string): Promise<PostDocument | null> {
    return this.postModel.findOne({ id });
  }
  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async clearPosts() {
    await this.postModel.deleteMany({});
  }
}
