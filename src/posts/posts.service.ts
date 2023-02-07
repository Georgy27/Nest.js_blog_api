import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from './posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async createPost(createPostDto: CreatePostDto): Promise<string | null> {
    // find a blog
    const blog = await this.blogsRepository.findBlogById(createPostDto.blogId);
    if (!blog) return null;
    // create new post
    const newPost = new this.postModel();
    newPost.createPost(createPostDto, blog.name);

    return this.postsRepository.save(newPost);
  }
  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<string | null> {
    // find post
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return null;
    // check for blogId
    if (updatePostDto.blogId !== post.blogId) return null;
    // update post
    post.updatePost(updatePostDto);
    return this.postsRepository.save(post);
  }
  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deleteBlog(id);
  }
}
