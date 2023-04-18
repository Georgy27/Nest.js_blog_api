import { Injectable } from '@nestjs/common';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { CommentViewModel } from '../../index';

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
}
