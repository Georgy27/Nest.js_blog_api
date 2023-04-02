import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from '../repositories/mongo/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';
import { PostsSqlRepository } from '../repositories/PostgreSQL/posts.sql.repository';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}
  async execute(command: DeletePostCommand): Promise<void> {
    // check if blog exists
    const isBlog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!isBlog)
      throw new NotFoundException('Blog with the given id does not exist');
    // find post
    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post)
      throw new NotFoundException('Post with the given id does not exist');
    // check user
    if (isBlog.bloggerId !== command.userId)
      throw new ForbiddenException(
        'Can not delete the post, if the blog does not belong to the current user',
      );
    // check for blogId

    if (command.blogId !== post.blogId)
      throw new ForbiddenException(
        'Can not delete the post, which does not belong the blog of current user',
      );
    await this.postsSqlRepository.deletePostById(command.postId);
  }
}
