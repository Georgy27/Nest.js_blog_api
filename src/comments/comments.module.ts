import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsRepository } from './comments.repository';
import { UsersModule } from '../users/users.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { Reaction, ReactionSchema } from '../reactions/schemas/reaction.schema';
import { JwtModule } from '@nestjs/jwt';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    UsersModule,
    ReactionsModule,
    forwardRef(() => PostsModule),
    JwtModule.register({}),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsQueryRepository, CommentsRepository],
  exports: [CommentsQueryRepository, CommentsRepository, CommentsService],
})
export class CommentsModule {}
