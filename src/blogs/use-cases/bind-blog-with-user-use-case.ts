import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { BlogsRepository } from '../blogs.repository';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';
import { Model } from 'mongoose';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsRepository.findBlogById(command.blogId);
    if (!isBlog)
      throw new BadRequestException({
        message: 'Blog does not exist',
        field: 'blogId',
      });
    if (isBlog.blogOwnerInfo.userId)
      throw new BadRequestException({
        message: 'User already bound to this blog',
        field: 'blogId',
      });
    // find user
    const isUser = await this.usersRepository.findUserById(command.userId);
    if (!isUser)
      throw new BadRequestException({
        message: 'User with the given id does not exist',
        field: 'userId',
      });
    // bind blog with user
    isBlog.blogOwnerInfo.userId = isUser.id;
    isBlog.blogOwnerInfo.userLogin = isUser.accountData.login;
    await this.blogsRepository.save(isBlog);
  }
}
