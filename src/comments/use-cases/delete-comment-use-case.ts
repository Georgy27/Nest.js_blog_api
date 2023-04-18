import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../posts/repositories/PostgreSQL/posts.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { CommentsRepositoryAdapter } from '../repositories/adapters/comments-repository.adapter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,

    public userId: string,
  ) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsRepositoryAdapter: CommentsRepositoryAdapter,
  ) {}
  async execute(command: DeleteCommentCommand) {
    // check if the comment exists
    const isComment = await this.commentsRepositoryAdapter.findCommentById(
      command.commentId,
    );
    if (!isComment) throw new NotFoundException();
    if (isComment.userId !== command.userId) throw new ForbiddenException();

    await this.commentsRepositoryAdapter.deleteCommentById(command.commentId);
  }
}
