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
import { PostsQueryRepository } from '../repositories/mongo/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/repositories/mongo/comments.query.repository';
import { PostReactionViewModel } from '../../helpers/reaction/reaction.view.model.wrapper';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentForPostDto } from '../dto/createCommentForPost.dto';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { CommentViewModel } from '../../comments';
import { UpdateReactionPostDto } from '../dto/update-reaction-post.dto';
import { JwtService } from '@nestjs/jwt';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAtPayload } from '../../auth/strategies';
import { ExtractUserPayloadFromAt } from '../../common/guards/exctract-payload-from-AT.guard';
import { GetUserIdFromAtDecorator } from '../../common/decorators/getUserIdFromAt.decorator';
import { BlogsQueryRepository } from '../../blogs/repositories/mongo/blogs.query.repository';
import { PostViewModel } from '../types';
import { PostsQuerySqlRepository } from '../repositories/PostgreSQL/posts.query.sql.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentForSpecifiedPostCommand } from '../../comments/use-cases/create-comment-for-specified-post-use-case';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsSqlQueryRepository: PostsQuerySqlRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(ExtractUserPayloadFromAt)
  @Get()
  async getAllPosts(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    return this.postsSqlQueryRepository.findPosts(
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
  ) {
    const post = await this.postsSqlQueryRepository.findPost(id, userId);

    if (!post) throw new NotFoundException();
    return post;
  }
  // @UseGuards(ExtractUserPayloadFromAt)
  // @Get(':postId/comments')
  // async getAllCommentsForPostId(
  //   @Query() postsPaginationDto: PostPaginationQueryDto,
  //   @Param('postId') postId: string,
  //   @GetUserIdFromAtDecorator() userId: string | null,
  // ): Promise<PaginationViewModel<CommentViewModel[]>> {
  //   const isPost = await this.postsQueryRepository.getMappedPost(postId);
  //   if (!isPost) throw new NotFoundException();
  //
  //   return this.commentsQueryRepository.findCommentsByPostId(
  //     postsPaginationDto.pageSize,
  //     postsPaginationDto.sortBy,
  //     postsPaginationDto.pageNumber,
  //     postsPaginationDto.sortDirection,
  //     postId,
  //     userId,
  //   );
  // }
  @UseGuards(AuthGuard('jwt'))
  @Post(':postId/comments')
  @HttpCode(201)
  async createCommentForSpecifiedPost(
    @Param('postId') postId: string,
    @Body() createCommentForPostDto: CreateCommentForPostDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    return this.commandBus.execute(
      new CreateCommentForSpecifiedPostCommand(
        postId,
        createCommentForPostDto,
        jwtAtPayload,
      ),
    );
    // const commentToView = await this.commentsQueryRepository.getMappedComment(
    //   newCommentId,
    // );
    // if (!commentToView) throw new NotFoundException();
    // return commentToView;
  }
  // @UseGuards(AuthGuard('jwt'))
  // @Put(':postId/like-status')
  // @HttpCode(204)
  // async updateReactionToPost(
  //   @Param('postId') postId: string,
  //   @Body() updateReactionPostDto: UpdateReactionPostDto,
  //   @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  // ): Promise<void> {
  //   return this.postsService.updateReactionToPost(
  //     postId,
  //     updateReactionPostDto,
  //     jwtAtPayload.userId,
  //   );
  // }
}
