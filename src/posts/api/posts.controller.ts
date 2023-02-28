import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostPaginationQueryDto } from '../../helpers/pagination/dto/posts.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { PostsService } from '../posts.service';
import { PostsQueryRepository } from '../posts.query.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { CreatePostDto } from '../dto/create.post.dto';
import { PostReactionViewModel } from '../../helpers/reaction/reaction.view.model.wrapper';
import { BasicAuthGuard } from '../../common/guards/basic.auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentForPostDto } from '../dto/createCommentForPost.dto';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { CommentViewModel } from '../../comments';
import { UpdateReactionPostDto } from '../dto/update-reaction-post.dto';
import { JwtService } from '@nestjs/jwt';
import { PostViewModel } from '../index';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAtPayload } from '../../auth/strategies';
import { ExtractUserPayloadFromAt } from '../../common/guards/exctract-payload-from-AT.guard';
import { GetUserIdFromAtDecorator } from '../../common/decorators/getUserIdFromAt.decorator';

@SkipThrottle()
@Controller('api/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private jwtService: JwtService,
  ) {}
  @UseGuards(ExtractUserPayloadFromAt)
  @Get()
  async getAllPosts(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<PaginationViewModel<PostReactionViewModel[]>> {
    return this.postsQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      userId,
    );
  }
  @UseGuards(ExtractUserPayloadFromAt)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<PostReactionViewModel> {
    const post = await this.postsQueryRepository.findPost(id, userId);

    if (!post) throw new NotFoundException();
    return post;
  }
  @UseGuards(ExtractUserPayloadFromAt)
  @Get(':postId/comments')
  async getAllCommentsForPostId(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @Param('postId') postId: string,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const isPost = await this.postsQueryRepository.getMappedPost(postId);
    if (!isPost) throw new NotFoundException();

    return this.commentsQueryRepository.findCommentsByPostId(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      postId,
      userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':postId/comments')
  @HttpCode(201)
  async createCommentForSpecifiedPost(
    @Param('postId') postId: string,
    @Body() createCommentForPostDto: CreateCommentForPostDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<CommentViewModel> {
    const newComment = await this.postsService.createCommentForSpecifiedPost(
      postId,
      createCommentForPostDto,
      jwtAtPayload.userId,
    );
    const commentToView = await this.commentsQueryRepository.getMappedComment(
      newComment,
    );
    if (!commentToView) throw new NotFoundException();
    return commentToView;
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateReactionToPost(
    @Param('postId') postId: string,
    @Body() updateReactionPostDto: UpdateReactionPostDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.postsService.updateReactionToPost(
      postId,
      updateReactionPostDto,
      jwtAtPayload.userId,
    );
  }
}
