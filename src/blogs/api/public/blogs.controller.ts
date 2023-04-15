import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../blogs.service';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsSQLQueryRepository } from '../../repositories/PostgreSQL/blogs.query.sql.repository';
import { BlogViewModel } from '../../types';
import { ExtractUserPayloadFromAt } from '../../../common/guards/exctract-payload-from-AT.guard';
import { GetUserIdFromAtDecorator } from '../../../common/decorators/getUserIdFromAt.decorator';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';
import { PostsQuerySqlRepository } from '../../../posts/repositories/PostgreSQL/posts.query.sql.repository';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsSqlQueryRepository: BlogsSQLQueryRepository,

    private readonly postsSqlQueryRepository: PostsQuerySqlRepository,
  ) {}
  @Get()
  async getAllBlogs(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogsSqlQueryRepository.findBlogs(
      blogsPaginationDto.searchNameTerm,
      blogsPaginationDto.pageSize,
      blogsPaginationDto.sortBy,
      blogsPaginationDto.pageNumber,
      blogsPaginationDto.sortDirection,
    );
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewModel | null> {
    const blog = await this.blogsSqlQueryRepository.findBlog(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }
  @UseGuards(ExtractUserPayloadFromAt)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetUserIdFromAtDecorator() userId: string | null,
  ) {
    // check if the blog exists
    const blog = await this.blogsSqlQueryRepository.findBlog(blogId);
    if (!blog) throw new NotFoundException();

    // return all posts for this blog
    return this.postsSqlQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      userId,
      blogId,
    );
  }
}
