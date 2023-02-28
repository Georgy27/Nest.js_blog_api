import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../blogs.service';
import { BlogsQueryRepository } from '../../blogs.query.repository';
import { Blog } from '../../schemas/blog.schema';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';
import { PostsQueryRepository } from '../../../posts/posts.query.repository';
import { PostsService } from '../../../posts/posts.service';
import { PostViewModel } from '../../../posts';
import { JwtService } from '@nestjs/jwt';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { ExtractUserPayloadFromAt } from '../../../common/guards/exctract-payload-from-AT.guard';
import { GetUserIdFromAtDecorator } from '../../../common/decorators/getUserIdFromAt.decorator';

@SkipThrottle()
@Controller('api/blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}
  @Get()
  async getAllBlogs(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
  ): Promise<PaginationViewModel<Blog[]>> {
    return this.blogsQueryRepository.findBlogs(
      blogsPaginationDto.searchNameTerm,
      blogsPaginationDto.pageSize,
      blogsPaginationDto.sortBy,
      blogsPaginationDto.pageNumber,
      blogsPaginationDto.sortDirection,
    );
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<Blog | null> {
    const blog = await this.blogsQueryRepository.findBlog(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }
  @UseGuards(ExtractUserPayloadFromAt)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetUserIdFromAtDecorator() userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    // check if the blog exists
    const getBlogByPostId = await this.blogsQueryRepository.findBlog(blogId);
    if (!getBlogByPostId) throw new NotFoundException();
    // return all posts for this blogId
    return this.postsQueryRepository.findPosts(
      postsPaginationDto.pageSize,
      postsPaginationDto.sortBy,
      postsPaginationDto.pageNumber,
      postsPaginationDto.sortDirection,
      userId,
      blogId,
    );
  }
}
