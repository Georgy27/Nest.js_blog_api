import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './api/posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';
import { CommentsModule } from '../comments/comments.module';
import { BlogsModule } from '../blogs/blogs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    CommentsModule,
    BlogsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsQueryRepository, PostsRepository],
})
export class PostsModule {}
