import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async createBlog(blog: Blog): Promise<Blog> {
    const newBlog = new this.blogModel(blog);
    return newBlog.save();
  }
  async updateBlog(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) {
    return this.blogModel.findOneAndUpdate(
      { id: blogId },

      { name, description, websiteUrl },
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async clearBlogs() {
    await this.blogModel.deleteMany({});
  }
}
