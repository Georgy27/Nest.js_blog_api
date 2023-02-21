import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { Blog, BlogModelType } from './schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}
  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<string> {
    const newBlog = this.blogModel.createBlog(
      name,
      description,
      websiteUrl,
      this.blogModel,
    );
    return this.blogsRepository.save(newBlog);
  }
  async updateBlog(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) return null;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    console.log(blog);
    return this.blogsRepository.save(blog);
  }
  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id);
  }
}
