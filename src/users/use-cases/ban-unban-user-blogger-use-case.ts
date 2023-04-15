import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repositories/mongo/users.repository';
import { SecurityDevicesRepository } from '../../security-devices/repositories/security.devices.repository';
import { CommentsRepository } from '../../comments/comments.repository';
import { ReactionsRepository } from '../../reactions/reactions.repository';
import { BanUserByBloggerDto } from '../dto/ban.user.blogger.dto';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';
import { raw } from '@nestjs/mongoose';
import { UsersSQLRepository } from '../repositories/PostgreSQL/users.sql.repository';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';

export class BanOrUnbanUserByBloggerCommand {
  constructor(
    public userId: string,
    public banUserByBloggerDto: BanUserByBloggerDto,
    public bloggerId: string,
  ) {}
}
@CommandHandler(BanOrUnbanUserByBloggerCommand)
export class BanOrUnbanUserByBloggerUseCase
  implements ICommandHandler<BanOrUnbanUserByBloggerCommand>
{
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: BanOrUnbanUserByBloggerCommand): Promise<void> {
    // check user
    if (command.userId === command.bloggerId)
      throw new ForbiddenException('Are you fucking kidding me');
    const isUser = await this.usersSQLRepository.findUserById(command.userId);
    if (!isUser)
      throw new NotFoundException('user with this Id does not exist');
    // check blog
    const isBlog = await this.blogsSqlRepository.findBlogById(
      command.banUserByBloggerDto.blogId,
    );

    if (!isBlog)
      throw new NotFoundException('blog with this Id does not exist');
    if (isBlog.bloggerId !== command.bloggerId)
      throw new ForbiddenException(
        'Can not ban the user to the blog that does not belongs to you',
      );
    // ban user info to blogger db
    const checkedBannedUser =
      await this.usersSQLRepository.findBannedUserByBlogger(
        command.userId,
        command.bloggerId,
        command.banUserByBloggerDto.blogId,
      );
    if (command.banUserByBloggerDto.isBanned && checkedBannedUser) return;

    if (command.banUserByBloggerDto.isBanned) {
      await this.usersSQLRepository.banUserByBlogger(
        command.bloggerId,
        isUser,
        command.banUserByBloggerDto,
      );
    }

    if (!command.banUserByBloggerDto.isBanned && checkedBannedUser) {
      await this.usersSQLRepository.unbanUserByBlogger(checkedBannedUser.id);
    }
  }
}
