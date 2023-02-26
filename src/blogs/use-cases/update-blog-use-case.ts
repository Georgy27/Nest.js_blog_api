import { UpdateBlogDto } from '../dto/update.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../schemas/blog.schema';

export class UpdateBlogCommand {
  constructor(public blogId: string, public updateBlogDto: UpdateBlogDto) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}
  async execute(command: UpdateBlogCommand): Promise<string | null> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) return null;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    console.log(blog);
    return this.blogsRepository.save(blog);
  }
}
