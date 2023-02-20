import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UsersRepository } from '../users/users.repository';
import { ReactionsRepository } from '../reactions/reactions.repository';
import { ReactionsService } from '../reactions/reactions.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateReactionCommentDto } from './dto/update-reaction-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly reactionsRepository: ReactionsRepository,
    private readonly reactionsService: ReactionsService,
  ) {}
  async updateReactionToComment(
    updateReactionCommentDto: UpdateReactionCommentDto,
    commentId: string,
    userId: string,
  ): Promise<void> {
    // check if the comment exists
    const isComment = await this.commentsRepository.findComment(commentId);
    if (!isComment) throw new NotFoundException();
    // get user login
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException();
    // create and save new Reaction in Reaction DB
    await this.reactionsService.updateReaction(
      'comment',
      commentId,
      userId,
      user.accountData.login,
      updateReactionCommentDto.likeStatus,
    );
  }
  async updateComment(
    commentId: string,
    updatecommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<void> {
    // find comment
    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) throw new NotFoundException();
    // check user
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    // update
    comment.content = updatecommentDto.content;
    await this.commentsRepository.save(comment);
  }
  async deleteComment(commentId: string, userId: string) {
    // find comment
    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) throw new NotFoundException();
    // check user
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    // delete
    await this.commentsRepository.delete(comment);
  }
}
