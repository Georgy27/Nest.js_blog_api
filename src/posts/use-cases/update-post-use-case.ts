import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { UpdatePostForBloggerDto } from '../../blogs/dto/update.post.blogger.dto';
import { PostsRepository } from '../repositories/mongo/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { PostsSqlRepository } from '../repositories/PostgreSQL/posts.sql.repository';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public updatePostForBloggerDto: UpdatePostForBloggerDto,
    public userId: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsSqlRepository: PostsSqlRepository,

    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    // check if blog exists
    const isBlog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!isBlog) throw new NotFoundException();
    // check user
    if (isBlog.bloggerId !== command.userId)
      throw new ForbiddenException('User id does not match');
    // find post
    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post)
      throw new NotFoundException(
        'Can not find the post with the given blogId',
      );
    // check for blogId
    if (command.blogId !== post.blogId)
      throw new ForbiddenException(
        'Can not update the post that does not belong to you',
      );
    return this.postsSqlRepository.updatePostById(
      post.id,
      command.updatePostForBloggerDto,
    );
  }
}
