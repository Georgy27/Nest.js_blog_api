import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../../blogs.service';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { PostsQueryRepository } from '../../../posts/repositories/mongo/posts.query.repository';
import { PostsService } from '../../../posts/posts.service';
import { JwtService } from '@nestjs/jwt';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsSQLQueryRepository } from '../../repositories/PostgreSQL/blogs.query.sql.repository';
import { Blog } from '@prisma/client';
import { BlogViewModel } from '../../types';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsSqlQueryRepository: BlogsSQLQueryRepository,

    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private jwtService: JwtService,
    private commandBus: CommandBus,
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
  // @UseGuards(ExtractUserPayloadFromAt)
  // @Get(':blogId/posts')
  // async getPostsByBlogId(
  //   @Param('blogId') blogId: string,
  //   @Query() postsPaginationDto: PostPaginationQueryDto,
  //   @GetUserIdFromAtDecorator() userId: string | null,
  // ): Promise<PaginationViewModel<PostViewModel[]>> {
  //   // check if the blog exists
  //   const getBlogByPostId = await this.blogsQueryRepository.findBlog(blogId);
  //   if (!getBlogByPostId) throw new NotFoundException();
  //   // return all posts for this blogId
  //   return this.postsQueryRepository.findPosts(
  //     postsPaginationDto.pageSize,
  //     postsPaginationDto.sortBy,
  //     postsPaginationDto.pageNumber,
  //     postsPaginationDto.sortDirection,
  //     userId,
  //     blogId,
  //   );
  // }
}
