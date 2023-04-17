import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentForPostDto } from '../../posts/dto/createCommentForPost.dto';
import { JwtAtPayload } from '../../auth/strategies';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsSqlRepository } from '../../posts/repositories/PostgreSQL/posts.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { CommentsRepositoryAdapter } from '../repositories/adapters/comments-repository.adapter';

export class CreateCommentForSpecifiedPostCommand {
  constructor(
    public postId: string,
    public createCommentForPostDto: CreateCommentForPostDto,
    public jwtAtPayload: JwtAtPayload,
  ) {}
}
@CommandHandler(CreateCommentForSpecifiedPostCommand)
export class CreateCommentForSpecifiedPostUseCase
  implements ICommandHandler<CreateCommentForSpecifiedPostCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
    private readonly commentsRepositoryAdapter: CommentsRepositoryAdapter,
  ) {}
  async execute(command: CreateCommentForSpecifiedPostCommand) {
    const { postId, jwtAtPayload, createCommentForPostDto } = command;
    // check if the post exists
    const isPost = await this.postsSqlRepository.findPostWithBloggerIdById(
      postId,
    );
    if (!isPost) throw new NotFoundException();
    // check if user exists
    const isUser = await this.usersSqlRepository.findUserById(
      jwtAtPayload.userId,
    );
    if (!isUser) throw new ForbiddenException();
    // check if the user is banned by blogger
    const isUserBannedByBlogger =
      await this.usersSqlRepository.findBannedUserByBlogger(
        isUser.id,
        isPost.blog.bloggerId,
        isPost.blogId,
      );
    if (isUserBannedByBlogger)
      throw new ForbiddenException('You have been banned by the blogger');
    // create comment
    return this.commentsRepositoryAdapter.createCommentForPost(
      isUser.id,
      isPost.id,
      createCommentForPostDto,
    );
  }
}
