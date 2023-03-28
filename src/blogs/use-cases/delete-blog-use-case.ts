import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repositories/mongo/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsSqlRepository } from '../repositories/PostgreSQL/blogs.sql.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsSQLRepository: BlogsSqlRepository) {}
  async execute(command: DeleteBlogCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsSQLRepository.findBlogById(command.blogId);
    // validate
    if (!isBlog) throw new NotFoundException();
    if (command.userId !== isBlog.bloggerId) throw new ForbiddenException();
    // delete
    await this.blogsSQLRepository.deleteBlog(command.blogId);
  }
}
