import { CreatePostDto } from '../dto/create.post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { PostsRepository } from '../repositories/mongo/posts.repository';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { JwtAtPayload } from '../../auth/strategies';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { PostsSqlRepository } from '../repositories/PostgreSQL/posts.sql.repository';
import { CreatePostModel } from '../types';

export class CreatePostForSpecifiedBlogCommand {
  constructor(
    public createPostDto: CreatePostDto,
    public jwtAtPayload: JwtAtPayload,
  ) {}
}
@CommandHandler(CreatePostForSpecifiedBlogCommand)
export class CreatePostForSpecifiedBlogUseCase
  implements ICommandHandler<CreatePostForSpecifiedBlogCommand>
{
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}
  async execute(
    command: CreatePostForSpecifiedBlogCommand,
  ): Promise<CreatePostModel> {
    // find a blog
    const blog = await this.blogsSqlRepository.findBlogById(
      command.createPostDto.blogId,
    );
    if (!blog) throw new NotFoundException();

    if (blog.bannedBlogs?.isBanned)
      throw new ForbiddenException("Can't create post for banned blog");

    // validate
    if (command.jwtAtPayload.userId !== blog.bloggerId)
      throw new ForbiddenException(
        "Can't create post for blog that doesn't belong to the current user",
      );

    // create new post
    return this.postsSqlRepository.createPostForSpecifiedBlog(
      command.createPostDto,
    );
  }
}
