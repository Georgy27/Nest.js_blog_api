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
import { BlogsService } from '../blogs.service';
import { BlogsQueryRepository } from '../blogs.query.repository';
import { CreateBlogDto } from '../dto/create.blog.dto';
import { UpdateBlogDto } from '../dto/update.blog.dto';
import { Blog } from '../schemas/blog.schema';
import { BlogsPaginationQueryDto } from '../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { PostPaginationQueryDto } from '../../helpers/pagination/dto/posts.pagination.query.dto';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { PostReactionViewModel } from '../../helpers/reaction/reaction.view.model.wrapper';
import { CreatePostByBlogIdDto } from '../dto/create.post.blogId.dto';
import { PostsService } from '../../posts/posts.service';
import { BasicAuthGuard } from '../../common/guards/basic.auth.guard';
import { PostViewModel } from '../../posts';
import { GetAccessToken } from '../../common/decorators/getAccessToken.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private jwtService: JwtService,
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
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() postsPaginationDto: PostPaginationQueryDto,
    @GetAccessToken() token: string | null,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    // check if the blog exists
    const getBlogByPostId = await this.blogsQueryRepository.findBlog(blogId);
    if (!getBlogByPostId) throw new NotFoundException();

    let userId: null | string = null;
    if (token) {
      const payload: any = await this.jwtService.decode(token);
      userId = payload.userId;
    }
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
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createBlog(@Body() createBlogDto: CreateBlogDto): Promise<Blog> {
    const blogId = await this.blogsService.createBlog(
      createBlogDto.name,
      createBlogDto.description,
      createBlogDto.websiteUrl,
    );
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
  }
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForSpecifiedBlog(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostByBlogIdDto,
  ) {
    // create post
    const newCreatePostDto = { ...createPostDto, blogId: blogId };
    const newPostId = await this.postsService.createPost(newCreatePostDto);
    if (!newPostId) throw new NotFoundException();
    // return post to user
    return this.postsQueryRepository.getMappedPost(newPostId);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    const updatedBlog = await this.blogsService.updateBlog(
      id,
      updateBlogDto.name,
      updateBlogDto.description,
      updateBlogDto.websiteUrl,
    );
    if (!updatedBlog) throw new NotFoundException();
    return;
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<void> {
    const deletedBlog = await this.blogsService.deleteBlog(id);
    if (!deletedBlog) throw new NotFoundException();
    return;
  }
}
