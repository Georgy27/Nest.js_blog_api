import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { BadRequestException } from '@nestjs/common';
import { BlogsSqlRepository } from '../repositories/PostgreSQL/blogs.sql.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSQLRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!isBlog)
      throw new BadRequestException({
        message: 'Blog does not exist',
        field: 'blogId',
      });
    if (isBlog.bloggerId)
      throw new BadRequestException({
        message: 'User already bound to this blog',
        field: 'blogId',
      });
    // find user
    const isUser = await this.usersSqlRepository.findUserById(command.userId);
    if (!isUser)
      throw new BadRequestException({
        message: 'User with the given id does not exist',
        field: 'userId',
      });
    // bind blog with user
  }
}
