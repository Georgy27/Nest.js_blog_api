import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './api/posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsQueryRepository, PostsRepository],
})
export class PostsModule {}
