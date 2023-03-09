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
import { UsersQueryRepository } from '../../users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserByBloggerDto } from '../../dto/ban.user.blogger.dto';
import { BanOrUnbanUserByBloggerCommand } from '../../use-cases/ban-unban-user-blogger-use-case';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtAtPayloadDecorator } from '../../../common/decorators/getJwtAtPayload.decorator';
import { JwtAtPayload } from '../../../auth/strategies';
import { UsersBannedByBloggerPaginationQueryDto } from '../../../helpers/pagination/dto/users-banned-by-blogger.pagination.query.dto';
import { BlogsQueryRepository } from '../../../blogs/blogs.query.repository';

@UseGuards(AuthGuard('jwt'))
@Controller('blogger/users')
export class UsersBloggerController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Get('blog/:id')
  async getBannedUsersForBlog(
    @Param('id') id: string,
    @Query()
    usersBannedByBloggerPaginationDto: UsersBannedByBloggerPaginationQueryDto,
  ) {
    const blog = await this.blogsQueryRepository.findBlog(id);
    if (!blog) throw new NotFoundException('blog is not found');
    if (blog.banInfo.isBanned)
      throw new ForbiddenException('blog is banned by admin');
    return this.blogsQueryRepository.getBannedUsersForBlog(
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
