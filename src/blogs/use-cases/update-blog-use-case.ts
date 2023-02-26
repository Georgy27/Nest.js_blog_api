import { UpdateBlogDto } from '../dto/update.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../schemas/blog.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    if (command.userId !== blog.blogOwnerInfo.userId)
      throw new ForbiddenException();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    await this.blogsRepository.save(blog);
  }
}
