import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostPaginationQueryDto } from '../../helpers/pagination/dto/posts.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { Post } from '../schemas/post.schema';
import { PostsService } from '../posts.service';
import { PostsQueryRepository } from '../posts.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  async getAllPosts(
    @Query() postsPaginationDto: PostPaginationQueryDto,
  ): Promise<PaginationViewModel<Post[]>> {
    return this.postsQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
    );
  }
  @Get(':id')
  async getPostById(@Param('id') id: string) {}
}
