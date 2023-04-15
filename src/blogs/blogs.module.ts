import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BloggersController } from './api/blogger/bloggers.controller';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './repositories/mongo/blogs.repository';
import { BlogsQueryRepository } from './repositories/mongo/blogs.query.repository';
import { PostsModule } from '../posts/posts.module';
import { JwtModule } from '@nestjs/jwt';
import { BlogIsExistValidator } from '../common/decorators/validation/blogId-validation.decorator';
import { CreateBlogUseCase } from './use-cases/create-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './use-cases/delete-blog-use-case';
import { BindBlogWithUserUseCase } from './use-cases/bind-blog-with-user-use-case';
import { UsersModule } from '../users/users.module';
import { BlogsSuperAdminController } from './api/super-admin/blogs-super-admin.controller';
import { BlogsController } from './api/public/blogs.controller';
import { CommentsModule } from '../comments/comments.module';
import { BanBlogByAdminUseCase } from './use-cases/ban-blog-by-admin-use-case';
import { BlogsSqlRepository } from './repositories/PostgreSQL/blogs.sql.repository';
import { BlogsSQLQueryRepository } from './repositories/PostgreSQL/blogs.query.sql.repository';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindBlogWithUserUseCase,
  BanBlogByAdminUseCase,
];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    forwardRef(() => PostsModule),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [BloggersController, BlogsController, BlogsSuperAdminController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsSqlRepository,
    BlogsSQLQueryRepository,
    BlogIsExistValidator,
    ...useCases,
  ],
  exports: [
    BlogsRepository,
    BlogsSqlRepository,
    BlogsQueryRepository,
    BlogsSQLQueryRepository,
  ],
})
export class BlogsModule {}
