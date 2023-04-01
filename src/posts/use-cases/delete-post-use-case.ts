import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from '../repositories/mongo/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';

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
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(command: DeletePostCommand): Promise<void> {
    // check if blog exists
    const isBlog = await this.blogsRepository.findBlogById(command.blogId);
    if (!isBlog) throw new NotFoundException();
    // find post
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException();
    // check user
    if (isBlog.blogOwnerInfo.userId !== command.userId)
      throw new ForbiddenException();
    // check for blogId
    if (command.blogId !== post.blogId) throw new ForbiddenException();
    await this.postsRepository.deletePostById(command.postId);
  }
}
