import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from './posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';
import { CreateCommentForPostDto } from './dto/createCommentForPost.dto';
import { UsersRepository } from '../users/users.repository';
import { randomUUID } from 'crypto';
import { Comment } from '../comments/schemas/comment.schema';
import { User } from '../users/schemas/user.schema';
import { CommentsRepository } from '../comments/comments.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
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
  async createCommentForSpecifiedPost(
    postId: string,
    createCommentForPostDto: CreateCommentForPostDto,
    userId: string,
  ): Promise<string> {
    // check if the post exists
    const isPost = await this.postsRepository.findPostById(postId);
    if (!isPost) throw new NotFoundException();
    // get user login
    const user: User | null = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException();
    // if it exists, create new comment
    const newComment: Comment = {
      id: randomUUID(),
      postId,
      content: createCommentForPostDto.content,
      commentatorInfo: {
        userId: userId,
        userLogin: user.accountData.login,
      },
      createdAt: new Date().toISOString(),
    };
    return this.commentsRepository.createComment(newComment);
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
  async deletePostById(id: string): Promise<boolean> {
    return this.postsRepository.deletePostById(id);
  }
}
