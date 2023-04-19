import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanBlogAdminDto } from '../dto/ban.blog.admin.dto';
import { NotFoundException } from '@nestjs/common';
import { BlogsSqlRepository } from '../repositories/PostgreSQL/blogs.sql.repository';

export class BanBlogByAdminCommand {
  constructor(public blogId: string, public banBlogAdminDto: BanBlogAdminDto) {}
}
@CommandHandler(BanBlogByAdminCommand)
export class BanBlogByAdminUseCase
  implements ICommandHandler<BanBlogByAdminCommand>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: BanBlogByAdminCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!isBlog)
      throw new NotFoundException('blog with this id does not exist');
    // ban or unban the blog
    const updateBlogBanInfo = command.banBlogAdminDto.isBanned
      ? {
          isBanned: command.banBlogAdminDto.isBanned,
          banDate: new Date().toISOString(),
        }
      : {
          isBanned: command.banBlogAdminDto.isBanned,
          banDate: null,
        };

    await this.blogsSqlRepository.updateBanBlogStatus(
      command.blogId,
      updateBlogBanInfo,
    );
  }
}
