import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async save(blog: BlogDocument): Promise<string> {
    await blog.save();
    return blog.id;
  }
  async findBlogById(id: string): Promise<BlogDocument | null> {
    return this.blogModel.findOne({ id });
  }
  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async clearBlogs() {
    await this.blogModel.deleteMany({});
  }
  // async addBannedUser(){
  //   await this.blogModel.
  // }
}
