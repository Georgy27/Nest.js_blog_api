import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './repositories/mongo/comments.query.repository';
import { CommentsRepository } from './repositories/mongo/comments.repository';
import { UsersModule } from '../users/users.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { Reaction, ReactionSchema } from '../reactions/schemas/reaction.schema';
import { JwtModule } from '@nestjs/jwt';
import { PostsModule } from '../posts/posts.module';
import { CommentsQuerySqlRepository } from './repositories/PostgreSQL/comments.query.sql.repository';
import { CommentsSqlRepository } from './repositories/PostgreSQL/comments.sql.repository';
import { CreateCommentForSpecifiedPostUseCase } from './use-cases/create-comment-for-specified-post-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsRepositoryAdapter } from './repositories/adapters/comments-repository.adapter';
import { CommentsQueryRepositoryAdapter } from './repositories/adapters/comments-query-repository.adapter';
import { UpdateReactionToCommentUseCase } from './use-cases/update-reaction-to-comment-use-case';

const useCases = [
  CreateCommentForSpecifiedPostUseCase,
  UpdateReactionToCommentUseCase,
];
const CommentsRepositoryProvider = {
  provide: CommentsRepositoryAdapter,
  useClass: CommentsSqlRepository,
};
const CommentsQueryRepositoryProvider = {
  provide: CommentsQueryRepositoryAdapter,
  useClass: CommentsQuerySqlRepository,
};
const Providers = [CommentsRepositoryProvider, CommentsQueryRepositoryProvider];
@Module({
  imports: [
    CqrsModule,
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
  providers: [
    CommentsService,
    CommentsQueryRepository,
    CommentsRepository,
    CommentsSqlRepository,
    ...Providers,
    ...useCases,
  ],
  exports: [
    CommentsQueryRepository,
    CommentsRepository,
    CommentsService,
    ...Providers,
  ],
})
export class CommentsModule {}
