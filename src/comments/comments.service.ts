import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { CommentsRepository } from './comments.repository';
import { UsersRepository } from '../users/users.repository';
import { ReactionsRepository } from '../reactions/reactions.repository';
import { ReactionsService } from '../reactions/reactions.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly reactionsRepository: ReactionsRepository,
    private readonly reactionsService: ReactionsService,
  ) {}
  async updateReaction(
    updateReactionDto: UpdateReactionDto,
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
      updateReactionDto.likeStatus,
    );
  }
}
