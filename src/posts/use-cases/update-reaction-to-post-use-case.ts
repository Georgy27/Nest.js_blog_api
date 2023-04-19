import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../repositories/PostgreSQL/posts.sql.repository';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { UpdateReactionPostDto } from '../dto/update-reaction-post.dto';
import { NotFoundException } from '@nestjs/common';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';

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
    private readonly postsSqlRepository: PostsSqlRepository,

    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
  ) {}
  async execute(command: UpdateReactionToPostCommand) {
    const { postId, updateReactionPostDto, userId } = command;
    // check if post exists
    const post = await this.postsSqlRepository.findPostById(postId);

    if (!post) throw new NotFoundException();

    // check user
    const user = await this.usersSqlRepository.findUserById(userId);

    if (!user) throw new NotFoundException();

    const isReaction = await this.postsSqlRepository.findReactionToPost(
      userId,
      postId,
    );

    if (!isReaction)
      return this.postsSqlRepository.createReactionToPost(
        userId,
        postId,
        updateReactionPostDto,
      );

    await this.postsSqlRepository.updateReactionToPost(
      isReaction.id,
      updateReactionPostDto,
    );
  }
}
