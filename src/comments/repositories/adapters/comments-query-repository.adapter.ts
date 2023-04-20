import { Injectable } from '@nestjs/common';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { CommentDbModel, CommentViewModel } from '../../index';
import { CommentsPaginationQueryDto } from '../../../helpers/pagination/dto/comments.pagination.dto';
import { Comment } from '@prisma/client';

@Injectable()
export abstract class CommentsQueryRepositoryAdapter {
  abstract findCommentsByPostId(
    postPaginationQueryDto: PostPaginationQueryDto,
    postId: string,
    userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>>;

  abstract findCommentById(
    id: string,
    userId: string | null,
  ): Promise<CommentViewModel | null>;

  public abstract getAllCommentsForAllPostsByBlogger(
    userId: string,
    commentsForPostsPaginationDto: CommentsPaginationQueryDto,
  ): Promise<PaginationViewModel<CommentViewModel[]>>;
}
