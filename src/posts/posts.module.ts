import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './api/posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';
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

const useCases = [
  CreatePostForSpecifiedBlogUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
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
  providers: [PostsService, PostsQueryRepository, PostsRepository, ...useCases],
  exports: [PostsQueryRepository, PostsService, PostsRepository],
})
export class PostsModule {}
