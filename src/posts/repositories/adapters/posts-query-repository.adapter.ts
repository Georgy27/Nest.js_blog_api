import { Injectable } from '@nestjs/common';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { PostViewModel } from '../../types';
import { PostReactionViewModel } from '../../../helpers/reaction/reaction.view.model.wrapper';

@Injectable()
export abstract class PostsQueryRepositoryAdapter {
  public abstract findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    blogId?: string,
  ): Promise<PaginationViewModel<PostViewModel[]>>;

  public abstract findPost(id: string): Promise<PostReactionViewModel | null>;
}
