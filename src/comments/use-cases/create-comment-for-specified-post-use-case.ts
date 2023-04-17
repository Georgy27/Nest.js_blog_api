import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentForPostDto } from '../../posts/dto/createCommentForPost.dto';
import { JwtAtPayload } from '../../auth/strategies';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';
import { Comment } from '../schemas/comment.schema';
import { randomUUID } from 'crypto';
import { PostsSqlRepository } from '../../posts/repositories/PostgreSQL/posts.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';

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
  }
}
