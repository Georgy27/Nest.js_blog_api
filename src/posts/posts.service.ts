import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from './posts.repository';
import { randomUUID } from 'crypto';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<string | null> {
    // find a blog
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) return null;
    // create new post
    const newPost = new this.postModel({
      id: randomUUID(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    });
    return this.postsRepository.save(newPost);
  }
  async updatePost(
    postId: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<string | null> {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return null;
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;
    return this.postsRepository.save(post);
  }
  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deleteBlog(id);
  }
}
