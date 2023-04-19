import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './api/posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './repositories/mongo/posts.query.repository';
import { PostsRepository } from './repositories/mongo/posts.repository';
import { CommentsModule } from '../comments/comments.module';
import { BlogsModule } from '../blogs/blogs.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ReactionsModule } from '../reactions/reactions.module';
import { Reaction, ReactionSchema } from '../reactions/schemas/reaction.schema';
import { CreatePostForSpecifiedBlogUseCase } from './use-cases/create-post-for-specified-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdatePostUseCase } from './use-cases/update-post-use-case';
import { DeletePostUseCase } from './use-cases/delete-post-use-case';
import { PostsSqlRepository } from './repositories/PostgreSQL/posts.sql.repository';
import { PostsQuerySqlRepository } from './repositories/PostgreSQL/posts.query.sql.repository';
import { PostsRepositoryAdapter } from './repositories/adapters/posts-repository.adapter';
import { PostsQueryRepositoryAdapter } from './repositories/adapters/posts-query-repository.adapter';

const useCases = [
  CreatePostForSpecifiedBlogUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
const PostsRepositoryProvider = {
  provide: PostsRepositoryAdapter,
  useClass: PostsSqlRepository,
};
const PostsQueryRepositoryProvider = {
  provide: PostsQueryRepositoryAdapter,
  useClass: PostsQuerySqlRepository,
};
const adapters = [PostsRepositoryProvider, PostsQueryRepositoryProvider];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    CommentsModule,
    BlogsModule,
    UsersModule,
    ReactionsModule,
    JwtModule.register({}),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    PostsSqlRepository,
    PostsQuerySqlRepository,
    ...useCases,
    ...adapters,
  ],
  exports: [...adapters],
})
export class PostsModule {}
