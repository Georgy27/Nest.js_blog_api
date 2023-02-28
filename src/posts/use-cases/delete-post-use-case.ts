import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { PostsRepository } from '../posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeletePostCommand {
  constructor(public blogId: string, public postId: string) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute(command: DeletePostCommand): Promise<void> {
    // find post
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException();
    // check for blogId
    if (command.blogId !== post.blogId) throw new ForbiddenException();
    await this.postsRepository.deletePostById(command.postId);
  }
}
