import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { UpdateReactionCommentDto } from '../dto/update-reaction-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { JwtService } from '@nestjs/jwt';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAtPayload } from '../../auth/strategies';
import { ExtractUserPayloadFromAt } from '../../common/guards/exctract-payload-from-AT.guard';
import { GetUserIdFromAtDecorator } from '../../common/decorators/getUserIdFromAt.decorator';
import { CommentsQueryRepositoryAdapter } from '../repositories/adapters/comments-query-repository.adapter';
import { CommentViewModel } from '../index';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepositoryAdapter: CommentsQueryRepositoryAdapter,
    private jwtService: JwtService,
  ) {}
  @UseGuards(ExtractUserPayloadFromAt)
  @Get(':id')
  async findCommentById(
    @Param('id') id: string,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepositoryAdapter.findCommentById(
      id,
      userId,
    );
    if (!comment) throw new NotFoundException();
    return comment;
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':commentId/like-status')
  @HttpCode(204)
  async updateReactionToComment(
    @Param('commentId') commentId: string,
    @Body() updateReactionCommentDto: UpdateReactionCommentDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commentsService.updateReactionToComment(
      updateReactionCommentDto,
      commentId,
      jwtAtPayload.userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':commentId')
  @HttpCode(204)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commentsService.updateComment(
      commentId,
      updateCommentDto,
      jwtAtPayload.userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commentsService.deleteComment(commentId, jwtAtPayload.userId);
  }
}
