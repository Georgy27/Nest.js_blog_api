import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository';
import { SecurityDevicesRepository } from '../../security-devices/security.devices.repository';
import { CommentsRepository } from '../../comments/comments.repository';
import { ReactionsRepository } from '../../reactions/reactions.repository';
import { BanUserByBloggerDto } from '../dto/ban.user.blogger.dto';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { raw } from '@nestjs/mongoose';

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
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BanOrUnbanUserByBloggerCommand): Promise<void> {
    // check user
    if (command.userId === command.bloggerId)
      throw new ForbiddenException('Are you fucking kidding me');
    const isUser = await this.usersRepository.findUserById(command.userId);
    if (!isUser)
      throw new NotFoundException('user with this Id does not exist');
    // check blog
    const isBlog = await this.blogsRepository.findBlogById(
      command.banUserByBloggerDto.blogId,
    );
    console.log(isBlog);
    if (!isBlog)
      throw new NotFoundException('blog with this Id does not exist');
    if (isBlog.blogOwnerInfo.userId !== command.bloggerId)
      throw new ForbiddenException('blog id does not match to userId');
    // ban user info to blogger db
    if (
      command.banUserByBloggerDto.isBanned &&
      isBlog.bannedUsersInfo.some((user) => user.id === command.userId)
    )
      return;
    else if (command.banUserByBloggerDto.isBanned) {
      isBlog.bannedUsersInfo.push({
        id: command.userId,
        login: isUser.accountData.login,
        banInfo: {
          isBanned: command.banUserByBloggerDto.isBanned,
          banDate: new Date().toISOString(),
          banReason: command.banUserByBloggerDto.banReason,
        },
      });
    } else {
      isBlog.bannedUsersInfo = isBlog.bannedUsersInfo.filter((user) => {
        return user.id !== command.userId;
      });
    }

    await this.blogsRepository.save(isBlog);
  }
}
