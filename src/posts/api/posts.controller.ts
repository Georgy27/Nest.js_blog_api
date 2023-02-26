import {
  Body,
  Controller,
  Delete,
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
import { UpdatePostDto } from '../dto/update.post.dto';
import { PostReactionViewModel } from '../../helpers/reaction/reaction.view.model.wrapper';
import { BasicAuthGuard } from '../../common/guards/basic.auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentForPostDto } from '../dto/createCommentForPost.dto';
import { GetJwtAtPayloadDecorator } from '../../common/decorators/getJwtAtPayload.decorator';
import { CommentViewModel } from '../../comments';
import { UpdateReactionPostDto } from '../dto/update-reaction-post.dto';
import { GetAccessToken } from '../../common/decorators/getAccessToken.decorator';
import { JwtService } from '@nestjs/jwt';
import { PostViewModel } from '../index';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAtPayload } from '../../auth/strategies';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private jwtService: JwtService,
  ) {}
  @Get()
  async getAllPosts(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetAccessToken() token: string | null,
  ): Promise<PaginationViewModel<PostReactionViewModel[]>> {
    let userId: null | string = null;
    if (token) {
      const payload: any = await this.jwtService.decode(token);
      userId = payload.userId;
    }
    return this.postsQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      userId,
    );
  }
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @GetAccessToken() token: string | null,
  ): Promise<PostReactionViewModel> {
    let userId: null | string = null;
    if (token) {
      const payload: any = await this.jwtService.decode(token);
      userId = payload.userId;
    }
    const post = await this.postsQueryRepository.findPost(id, userId);

    if (!post) throw new NotFoundException();
    return post;
  }
  @Get(':postId/comments')
  async getAllCommentsForPostId(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @Param('postId') postId: string,
    @GetAccessToken() token: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const isPost = await this.postsQueryRepository.getMappedPost(postId);
    if (!isPost) throw new NotFoundException();
    let userId: null | string = null;
    if (token) {
      const payload: any = await this.jwtService.decode(token);
      userId = payload.userId;
    }
    return this.commentsQueryRepository.findCommentsByPostId(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      postId,
      userId,
    );
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    const postId = await this.postsService.createPost(createPostDto);
    if (!postId) throw new NotFoundException();
    const post = await this.postsQueryRepository.getMappedPost(postId);
    if (!post) throw new NotFoundException();
    return post;
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
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const updatedPost = await this.postsService.updatePost(id, updatePostDto);
    console.log(updatedPost);
    if (!updatedPost) throw new NotFoundException();
    return;
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
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string): Promise<void> {
    const deletedPost = await this.postsService.deletePostById(id);
    if (!deletedPost) throw new NotFoundException();
    return;
  }
}
