import { CreateCommentForPostDto } from '../../posts/dto/createCommentForPost.dto';
import { JwtAtPayload } from '../../auth/strategies';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../posts/repositories/PostgreSQL/posts.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { CommentsRepositoryAdapter } from '../repositories/adapters/comments-repository.adapter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateReactionCommentDto } from '../dto/update-reaction-comment.dto';
import { CommentsQueryRepositoryAdapter } from '../repositories/adapters/comments-query-repository.adapter';

export class UpdateReactionToCommentCommand {
  constructor(
    public updateReactionCommentDto: UpdateReactionCommentDto,
    public commentId: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateReactionToCommentCommand)
export class UpdateReactionToCommentUseCase
  implements ICommandHandler<UpdateReactionToCommentCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
    private readonly commentsRepositoryAdapter: CommentsRepositoryAdapter,
  ) {}
  async execute(command: UpdateReactionToCommentCommand) {
    // check if the comment exists
    const isComment = await this.commentsRepositoryAdapter.findCommentById(
      command.commentId,
    );
    if (!isComment) throw new NotFoundException();
    // check user
    const user = await this.usersSqlRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException();

    const isReaction =
      await this.commentsRepositoryAdapter.findReactionToComment(
        command.userId,
        command.commentId,
      );

    if (!isReaction)
      return this.commentsRepositoryAdapter.createReactionToComment(
        command.userId,
        command.commentId,
        command.updateReactionCommentDto,
      );

    return this.commentsRepositoryAdapter.updateReactionToComment(
      isReaction.id,
      command.updateReactionCommentDto,
    );
  }
}
