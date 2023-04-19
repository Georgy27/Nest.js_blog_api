import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostDbModel, PostViewModel } from '../../types';
import { PostReactionViewModel } from '../../../helpers/reaction/reaction.view.model.wrapper';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';

import {
  postQueryFilter,
  postsQueryFilter,
} from '../../../helpers/filter/post.query.filter';
import { PostsQueryRepositoryAdapter } from '../adapters/posts-query-repository.adapter';
@Injectable()
export class PostsQuerySqlRepository extends PostsQueryRepositoryAdapter {
  constructor(private prisma: PrismaService) {
    super();
  }

  public async findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    blogId?: string,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const postsFilter = postsQueryFilter(blogId);

    const posts: PostDbModel[] = await this.prisma.post.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: postsFilter,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        createdAt: true,
        blogId: true,
        blog: {
          select: {
            name: true,
          },
        },
      },
    });
    const numberOfPosts = await this.prisma.post.count({
      where: postsFilter,
    });
    const postsWithLikesInfo = posts.map((post) => {
      return new PostReactionViewModel(post);
    });
    return new PaginationViewModel<PostViewModel[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      postsWithLikesInfo,
    );
  }

  public async findPost(id: string): Promise<PostReactionViewModel | null> {
    const postFilter = postQueryFilter(id);

    const post = await this.prisma.post.findFirst({
      where: postFilter,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        createdAt: true,
        blogId: true,
        blog: {
          select: {
            name: true,
          },
        },
      },
    });
    if (post) return new PostReactionViewModel(post);
    return null;
  }
}
