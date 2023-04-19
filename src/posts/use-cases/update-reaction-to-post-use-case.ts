import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { UpdateReactionPostDto } from '../dto/update-reaction-post.dto';
import { NotFoundException } from '@nestjs/common';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { PostsRepositoryAdapter } from '../repositories/adapters/posts-repository.adapter';

export class UpdateReactionToPostCommand {
  constructor(
    public postId: string,
    public updateReactionPostDto: UpdateReactionPostDto,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateReactionToPostCommand)
export class UpdateReactionToPostUseCase
  implements ICommandHandler<UpdateReactionToPostCommand>
{
  constructor(
    private readonly postsRepositoryAdapter: PostsRepositoryAdapter,

    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
  ) {}
  async execute(command: UpdateReactionToPostCommand) {
    const { postId, updateReactionPostDto, userId } = command;
    // check if post exists
    const post = await this.postsRepositoryAdapter.findPostById(postId);

    if (!post) throw new NotFoundException();

    // check user
    const user = await this.usersSqlRepository.findUserById(userId);

    if (!user) throw new NotFoundException();

    const isReaction = await this.postsRepositoryAdapter.findReactionToPost(
      userId,
      postId,
    );

    if (!isReaction)
      return this.postsRepositoryAdapter.createReactionToPost(
        userId,
        postId,
        updateReactionPostDto,
      );

    await this.postsRepositoryAdapter.updateReactionToPost(
      isReaction.id,
      updateReactionPostDto,
    );
  }
}
