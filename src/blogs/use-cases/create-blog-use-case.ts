import { CreateBlogDto } from '../dto/create.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAtPayload } from '../../auth/strategies';
import { BlogsSqlRepository } from '../repositories/PostgreSQL/blogs.sql.repository';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: CreateBlogDto,
    public jwtAtPayload: JwtAtPayload,
  ) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute(command: CreateBlogCommand) {
    return this.blogsSqlRepository.createBlog(
      command.createBlogDto,
      command.jwtAtPayload,
    );
  }
}
