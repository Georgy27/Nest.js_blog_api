import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repositories/mongo/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<void> {
    // find blog
    const isBlog = await this.blogsRepository.findBlogById(command.blogId);
    // validate
    if (!isBlog) throw new NotFoundException();
    if (command.userId !== isBlog.blogOwnerInfo.userId)
      throw new ForbiddenException();
    // delete
    await this.blogsRepository.deleteBlog(command.blogId);
  }
}
