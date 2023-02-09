import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsRepository } from './comments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsQueryRepository, CommentsRepository],
  exports: [CommentsQueryRepository, CommentsRepository],
})
export class CommentsModule {}
