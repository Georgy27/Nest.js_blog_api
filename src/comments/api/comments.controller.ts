import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CommentsQueryRepository } from '../comments.query.repository';
import { Comment } from '../schemas/comment.schema';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get(':id')
  async getCommentById(@Param('id') id: string): Promise<Comment | null> {
    const comment: Comment | null =
      await this.commentsQueryRepository.findComment(id);
    if (!comment) throw new NotFoundException();
    return comment;
  }
}
