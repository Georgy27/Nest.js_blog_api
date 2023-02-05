import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { Blog } from './schemas/blog.schema';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<Blog> {
    const newBlog: Blog = {
      id: randomUUID(),
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: true,
    };
    return this.blogsRepository.createBlog(newBlog);
  }
  async updateBlog(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) {
    return this.blogsRepository.updateBlog(
      blogId,
      name,
      description,
      websiteUrl,
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id);
  }
}
