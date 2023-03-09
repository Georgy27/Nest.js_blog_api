import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogsRepository } from '../blogs.repository';
import { UsersRepository } from '../../users/users.repository';
import { BanBlogAdminDto } from '../dto/ban.blog.admin.dto';
import { NotFoundException } from '@nestjs/common';

export class BanBlogByAdminCommand {
  constructor(public blogId: string, public banBlogAdminDto: BanBlogAdminDto) {}
}
@CommandHandler(BanBlogByAdminCommand)
export class BanBlogByAdminUseCase
  implements ICommandHandler<BanBlogByAdminCommand>
{
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BanBlogByAdminCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsRepository.findBlogById(command.blogId);
    if (!isBlog)
      throw new NotFoundException('blog with this id does not exist');

    const updateBanInfo = command.banBlogAdminDto.isBanned
      ? {
          isBanned: command.banBlogAdminDto.isBanned,
          banDate: new Date().toISOString(),
        }
      : {
          isBanned: command.banBlogAdminDto.isBanned,
          banDate: null,
        };
    isBlog.banInfo = updateBanInfo;
    await this.blogsRepository.save(isBlog);
  }
}
