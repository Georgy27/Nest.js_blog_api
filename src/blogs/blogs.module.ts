import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';
import { BlogsQueryRepository } from './blogs.query.repository';
import { PostsModule } from '../posts/posts.module';
import { JwtModule } from '@nestjs/jwt';
import { BlogIsExistValidator } from '../common/decorators/validation/blogId-validation.decorator';
import { CreateBlogUseCase } from './use-cases/create-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './use-cases/delete-blog-use-case';

const useCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    forwardRef(() => PostsModule),
    JwtModule.register({}),
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogIsExistValidator,
    ...useCases,
  ],
  exports: [BlogsRepository],
})
export class BlogsModule {}
