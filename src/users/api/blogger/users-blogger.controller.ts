import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users.service';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserByBloggerDto } from '../../dto/ban.user.blogger.dto';
import { BanOrUnbanUserByBloggerCommand } from '../../use-cases/ban-unban-user-blogger-use-case';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtAtPayloadDecorator } from '../../../common/decorators/getJwtAtPayload.decorator';
import { JwtAtPayload } from '../../../auth/strategies';
import { UsersBannedByBloggerPaginationQueryDto } from '../../../helpers/pagination/dto/users-banned-by-blogger.pagination.query.dto';
import { BlogsSQLQueryRepository } from '../../../blogs/repositories/PostgreSQL/blogs.query.sql.repository';
import { BlogsSqlRepository } from '../../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { UsersSQLQueryRepository } from '../../repositories/PostgreSQL/users.sql.query.repository';

@UseGuards(AuthGuard('jwt'))
@Controller('blogger/users')
export class UsersBloggerController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSqlQueryRepository: UsersSQLQueryRepository,
    private readonly blogsSqlQueryRepository: BlogsSQLQueryRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private commandBus: CommandBus,
  ) {}
  @Get('blog/:id')
  async getBannedUsersForBlog(
    @Param('id') id: string,
    @Query()
    usersBannedByBloggerPaginationDto: UsersBannedByBloggerPaginationQueryDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    const blog = await this.blogsSqlRepository.findBlogById(id);
    if (!blog) throw new NotFoundException('blog is not found');
    if (blog.bloggerId !== jwtAtPayload.userId)
      throw new ForbiddenException(
        'can not view the blogs that belong to another blogger',
      );
    if (blog?.bannedBlogs?.isBanned)
      throw new ForbiddenException('blog is banned by admin');

    return this.usersSqlQueryRepository.getBannedUsersForBlog(
      blog,
      usersBannedByBloggerPaginationDto,
    );
  }
  @Put(':id/ban')
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') id: string,
    @Body() banUserByBloggerDto: BanUserByBloggerDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    return this.commandBus.execute(
      new BanOrUnbanUserByBloggerCommand(
        id,
        banUserByBloggerDto,
        jwtAtPayload.userId,
      ),
    );
  }
}
