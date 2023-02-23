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
import { CommentsQueryRepository } from '../comments.query.repository';
import { UpdateReactionCommentDto } from '../dto/update-reaction-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { GetAccessToken } from '../../common/decorators/getAccessToken.decorator';
import { JwtService } from '@nestjs/jwt';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private jwtService: JwtService,
  ) {}
  @Get(':id')
  async getCommentById(
    @Param('id') id: string,
    @GetAccessToken() token: string | null,
  ) {
    let userId: null | string = null;
    if (token) {
      const payload: any = await this.jwtService.decode(token);
      userId = payload.userId;
    }

    const comment = await this.commentsQueryRepository.findComment(id, userId);
    if (!comment) throw new NotFoundException();
    return comment;
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':commentId/like-status')
  @HttpCode(204)
  async updateReactionToComment(
    @Param('commentId') commentId: string,
    @Body() updateReactionCommentDto: UpdateReactionCommentDto,
    @GetJwtAtPayloadDecorator() userId: string,
  ): Promise<void> {
    return this.commentsService.updateReactionToComment(
      updateReactionCommentDto,
      commentId,
      userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':commentId')
  @HttpCode(204)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetJwtAtPayloadDecorator() userId: string,
  ): Promise<void> {
    return this.commentsService.updateComment(
      commentId,
      updateCommentDto,
      userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetJwtAtPayloadDecorator() userId: string,
  ): Promise<void> {
    console.log(commentId, userId);
    return this.commentsService.deleteComment(commentId, userId);
  }
}
