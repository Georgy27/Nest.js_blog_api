import { Injectable } from '@nestjs/common';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { PostViewModel } from '../../types';
import { PostReactionViewModel } from '../../../helpers/reaction/reaction.view.model.wrapper';
import { Blog, Post } from '@prisma/client';

@Injectable()
export abstract class PostsQueryRepositoryAdapter {
  public abstract findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    userId: string | null,
    blogId?: string,
  ): Promise<PaginationViewModel<PostViewModel[]>>;

  public abstract findPost(
    id: string,
    userId: string | null,
  ): Promise<PostReactionViewModel | null>;

  // public abstract findAllPostsForAllBloggerBlogs(
  //   blogs: Blog[],
  // ): Promise<Post[]>;
}
