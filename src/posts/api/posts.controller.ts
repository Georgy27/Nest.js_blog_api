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
} from '@nestjs/common';
import { PostPaginationQueryDto } from '../../helpers/pagination/dto/posts.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { PostsService } from '../posts.service';
import { PostsQueryRepository } from '../posts.query.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { Comment } from '../../comments/schemas/comment.schema';
import { CreatePostDto } from '../dto/create.post.dto';
import { UpdatePostDto } from '../dto/update.post.dto';
import { PostReactionViewModel } from '../../helpers/reaction/reaction.view.model.wrapper';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  async getAllPosts(
    @Query() postsPaginationDto: PostPaginationQueryDto,
  ): Promise<PaginationViewModel<PostReactionViewModel[]>> {
    return this.postsQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
    );
  }
  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<PostReactionViewModel> {
    const post = await this.postsQueryRepository.findPost(id);

    if (!post) throw new NotFoundException();
    return post;
  }
  @Get(':postId/comments')
  async getAllCommentsForPostId(
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @Param('postId') postId: string,
  ): Promise<PaginationViewModel<Comment[]>> {
    return this.commentsQueryRepository.findCommentsByPostId(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      postId,
    );
  }
  @Post()
  @HttpCode(201)
  async createPost(@Body() createPostDto: CreatePostDto) {
    const postId = await this.postsService.createPost(createPostDto);
    if (!postId) throw new NotFoundException();
    return this.postsQueryRepository.findPost(postId);
  }
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
  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string): Promise<void> {
    const deletedPost = await this.postsService.deletePost(id);
    if (!deletedPost) throw new NotFoundException();
    return;
  }
}
