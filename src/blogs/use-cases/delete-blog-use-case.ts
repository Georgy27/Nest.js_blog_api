import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    return this.blogsRepository.deleteBlog(command.id);
  }
}
