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
import { postReactionQueryFilter } from '../../../helpers/filter/reaction.query.filter';
import { reactionStatusEnumKeys } from '../../../helpers/reaction';
import { userPostStatusQueryFilter } from '../../../helpers/filter/user-status.query.filter';
import { Blog, Post } from '@prisma/client';
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
    userId: string | null,
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

    const postsWithLikesInfo = await Promise.all(
      posts.map((post) => {
        return this.addReactionsInfoToPost(post, userId);
      }),
    );

    const numberOfPosts = await this.prisma.post.count({
      where: postsFilter,
    });

    return new PaginationViewModel<PostViewModel[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      postsWithLikesInfo,
    );
  }

  public async findPost(
    id: string,
    userId: string,
  ): Promise<PostReactionViewModel | null> {
    const postFilter = postQueryFilter(id);

    const post: PostDbModel | null = await this.prisma.post.findFirst({
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
    if (post) return this.addReactionsInfoToPost(post, userId);
    return null;
  }

  public async findAllPostsForAllBloggerBlogs(blogs: Blog[]): Promise<Post[]> {
    const [...posts] = await Promise.all(
      blogs.map((blog) => {
        return this.prisma.post.findMany({ where: { blogId: blog.id } });
      }),
    );

    return posts.flat();
  }

  // (async() => {
  //   const [...ret] = await Promise.all([
  //                                        func(),
  //                                        func(),
  //                                        func(),
  //                                      ]);

  private async addReactionsInfoToPost(
    post: PostDbModel,
    userId: string | null,
  ) {
    const likes = await this.prisma.postLikeStatus.count({
      where: postReactionQueryFilter(post.id, 'Like'),
    });
    const dislikes = await this.prisma.postLikeStatus.count({
      where: postReactionQueryFilter(post.id, 'Dislike'),
    });
    const newestLikes = await this.prisma.postLikeStatus.findMany({
      take: 3,
      where: postReactionQueryFilter(post.id, 'Like'),
      orderBy: {
        addedAt: 'desc',
      },
      select: {
        addedAt: true,
        userId: true,
        user: {
          select: {
            login: true,
          },
        },
      },
    });

    const mappedNewestLikes = newestLikes.map((likes) => {
      return {
        addedAt: likes.addedAt.toISOString(),
        userId: likes.userId,
        login: likes.user!.login,
      };
    });

    let myStatus: reactionStatusEnumKeys = 'None';
    if (userId) {
      const userReactionStatus = await this.prisma.postLikeStatus.findFirst({
        where: userPostStatusQueryFilter(post.id, userId),
      });
      if (userReactionStatus) myStatus = userReactionStatus.likeStatus;
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likes,
        dislikesCount: dislikes,
        myStatus: myStatus,
        newestLikes: mappedNewestLikes,
      },
    };
  }
}
