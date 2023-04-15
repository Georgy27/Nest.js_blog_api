import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
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
import { BanBlogAdminDto } from '../../dto/ban.blog.admin.dto';
import { BanBlogByAdminCommand } from '../../use-cases/ban-blog-by-admin-use-case';
import { BlogsSQLQueryRepository } from '../../repositories/PostgreSQL/blogs.query.sql.repository';

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsSqlQueryRepository: BlogsSQLQueryRepository,
  ) {}
  @Get()
  async getBlogsForSuperAdmin(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
  ) {
    return this.blogsSqlQueryRepository.findBlogsForSuperAdmin(
      blogsPaginationDto.searchNameTerm,
      blogsPaginationDto.pageSize,
      blogsPaginationDto.sortBy,
      blogsPaginationDto.pageNumber,
      blogsPaginationDto.sortDirection,
    );
  }
  @Put(':id/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ) {
    return this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
  }
  @Put(':id/ban')
  @HttpCode(204)
  async banBlogByAdmin(
    @Param('id') blogId: string,
    @Body() banBlogAdminDto: BanBlogAdminDto,
  ) {
    return this.commandBus.execute(
      new BanBlogByAdminCommand(blogId, banBlogAdminDto),
    );
  }
}
