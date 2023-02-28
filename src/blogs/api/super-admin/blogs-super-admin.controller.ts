import { SkipThrottle } from '@nestjs/throttler';
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../common/guards/basic.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../../use-cases/bind-blog-with-user-use-case';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('api/sa/blogs')
export class BlogsSuperAdminController {
  constructor(private commandBus: CommandBus) {}
  @Put(':id/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
  }
  @Get()
  async getBlogsForSuperAdmin(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
  ) {
    // return this.blogsQueryRepository.findBlogs(
    //   blogsPaginationDto.searchNameTerm,
    //   blogsPaginationDto.pageSize,
    //   blogsPaginationDto.sortBy,
    //   blogsPaginationDto.pageNumber,
    //   blogsPaginationDto.sortDirection,
    // );
  }
}
