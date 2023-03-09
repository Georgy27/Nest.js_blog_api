import { CreatePostDto } from '../dto/create.post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { JwtAtPayload } from '../../auth/strategies';

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
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(
    command: CreatePostForSpecifiedBlogCommand,
  ): Promise<string | null> {
    // find a blog
    const blog = await this.blogsRepository.findBlogById(
      command.createPostDto.blogId,
    );
    if (!blog) throw new NotFoundException();
    if (blog.banInfo.isBanned)
      throw new ForbiddenException("Can't create post for banned blog");
    // validate
    if (command.jwtAtPayload.userId !== blog.blogOwnerInfo.userId)
      throw new ForbiddenException();
    // create new post
    const newPost = new this.postModel();
    newPost.createPost(
      command.createPostDto,
      blog.name,
      command.jwtAtPayload.userId,
    );

    return this.postsRepository.save(newPost);
  }
}
