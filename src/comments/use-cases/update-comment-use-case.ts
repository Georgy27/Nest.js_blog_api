import { UpdateReactionCommentDto } from '../dto/update-reaction-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../posts/repositories/PostgreSQL/posts.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { CommentsRepositoryAdapter } from '../repositories/adapters/comments-repository.adapter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public updateCommentDto: UpdateCommentDto,

    public userId: string,
  ) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
    private readonly commentsRepositoryAdapter: CommentsRepositoryAdapter,
  ) {}
  async execute(command: UpdateCommentCommand) {
    // check if the comment exists
    const isComment = await this.commentsRepositoryAdapter.findCommentById(
      command.commentId,
    );
    if (!isComment) throw new NotFoundException();
    if (isComment.userId !== command.userId) throw new ForbiddenException();

    await this.commentsRepositoryAdapter.updateCommentById(
      command.commentId,
      command.updateCommentDto.content,
    );
  }
}
