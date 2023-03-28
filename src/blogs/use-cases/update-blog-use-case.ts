import { UpdateBlogDto } from '../dto/update.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repositories/mongo/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsSqlRepository } from '../repositories/PostgreSQL/blogs.sql.repository';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public updateBlogDto: UpdateBlogDto,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsSQLRepository: BlogsSqlRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogDocument,
  ) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blog = await this.blogsSQLRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    if (command.userId !== blog.bloggerId) throw new ForbiddenException();

    await this.blogsSQLRepository.updateBlog(
      command.blogId,
      command.updateBlogDto,
    );
  }
}
