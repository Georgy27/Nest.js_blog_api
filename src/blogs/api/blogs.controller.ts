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
import { BlogsService } from '../blogs.service';
import { BlogsQueryRepository } from '../blogs.query.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { Blog } from '../schemas/blog.schema';
import { BlogsPaginationQueryDto } from '../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
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
  async getBlogById(@Param('id') id: string) {
    const blog: Blog | null = await this.blogsQueryRepository.findBlog(id);

    if (!blog) throw new NotFoundException();
    return blog;
  }
  @Post()
  @HttpCode(201)
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(
      createBlogDto.name,
      createBlogDto.description,
      createBlogDto.websiteUrl,
    );
  }
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const updatedBlog = await this.blogsService.updateBlog(
      id,
      updateBlogDto.name,
      updateBlogDto.description,
      updateBlogDto.websiteUrl,
    );
    if (!updatedBlog) throw new NotFoundException();
    return;
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string) {
    const deletedBlog = await this.blogsService.deleteBlog(id);
    if (!deletedBlog) throw new NotFoundException();
    return;
  }
}
