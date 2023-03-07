import { CreateBlogDto } from '../dto/create.blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { BlogsRepository } from '../blogs.repository';
import { JwtAtPayload } from '../../auth/strategies';
import { Model } from 'mongoose';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: CreateBlogDto,
    public jwtAtPayload: JwtAtPayload,
  ) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(command: CreateBlogCommand): Promise<string> {
    const { name, description, websiteUrl } = command.createBlogDto;
    const { userId, userLogin } = command.jwtAtPayload;
    const newBlog = new this.blogModel();
    newBlog.createBlog(name, description, websiteUrl, userId, userLogin);
    return this.blogsRepository.save(newBlog);
  }
}
