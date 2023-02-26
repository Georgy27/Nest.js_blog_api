import { CreateBlogDto } from '../dto/create.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../schemas/blog.schema';
import { BlogsRepository } from '../blogs.repository';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(command: CreateBlogCommand) {
    const { name, description, websiteUrl } = command.createBlogDto;
    const newBlog = this.blogModel.createBlog(
      name,
      description,
      websiteUrl,
      this.blogModel,
    );
    return this.blogsRepository.save(newBlog);
  }
}
