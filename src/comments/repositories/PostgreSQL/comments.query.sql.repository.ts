import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommentsQueryRepositoryAdapter } from '../adapters/comments-query-repository.adapter';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';

import { reactionStatusEnumKeys } from '../../../helpers/reaction';
import { commentReactionQueryFilter } from '../../../helpers/filter/reaction.query.filter';
import {
  CommentDbModel,
  CommentViewModel,
  CommentWithOrWithoutPostInfo,
  CommentWithPostInfoDbModel,
} from '../../index';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import {
  allCommentsForAllPostsQueryFilter,
  commentQueryFilter,
  commentsQueryFilter,
} from '../../../helpers/filter/comment.query.filter';
import { userCommentStatusQueryFilter } from '../../../helpers/filter/user-status.query.filter';
import { Comment, Post } from '@prisma/client';
import { CommentsPaginationQueryDto } from '../../../helpers/pagination/dto/comments.pagination.dto';
import { determineCommentType } from '../../helpers/determineCommentType';

@Injectable()
export class CommentsQuerySqlRepository extends CommentsQueryRepositoryAdapter {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async findCommentsByPostId(
    postPaginationQueryDto: PostPaginationQueryDto,
    postId: string,
    userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const { pageNumber, pageSize, sortDirection, sortBy } =
      postPaginationQueryDto;

    const commentsFilter = commentsQueryFilter(postId);
    const comments = await this.prisma.comment.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: commentsFilter,
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            login: true,
          },
        },
      },
    });
    const commentsWithLikesInfo = await Promise.all(
      comments.map(async (comment) => {
        return this.addReactionsInfoToComment(comment, userId);
      }),
    );
    const numberOfComments = await this.prisma.comment.count({
      where: commentsFilter,
    });
    return new PaginationViewModel<CommentViewModel[]>(
      numberOfComments,
      pageNumber,
      pageSize,
      commentsWithLikesInfo,
    );
  }
  async findCommentById(
    id: string,
    userId: string | null,
  ): Promise<CommentViewModel | null> {
    const commentFilter = commentQueryFilter(id);

    const comment = await this.prisma.comment.findFirst({
      where: commentFilter,
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            login: true,
          },
        },
      },
    });

    if (!comment) return null;

    return await this.addReactionsInfoToComment(comment, userId);
  }

  public async getAllCommentsForAllPostsByBlogger(
    userId: string,
    commentsForPostsPaginationDto: CommentsPaginationQueryDto,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      commentsForPostsPaginationDto;
    const allCommentsFilter = allCommentsForAllPostsQueryFilter(userId);

    const allComments: CommentWithPostInfoDbModel[] =
      await this.prisma.comment.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [sortBy]: sortDirection,
        },
        where: allCommentsFilter,
        select: {
          id: true,
          content: true,
          postId: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              login: true,
            },
          },
          post: {
            select: {
              title: true,
              blogId: true,
              blog: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    const commentsWithLikesInfo = await Promise.all(
      allComments.map(async (comment) => {
        return this.addReactionsInfoToComment(comment, userId);
      }),
    );

    const numberOfComments = await this.prisma.comment.count({
      where: allCommentsFilter,
    });
    return new PaginationViewModel<CommentViewModel[]>(
      numberOfComments,
      pageNumber,
      pageSize,
      commentsWithLikesInfo,
    );
  }

  private async addReactionsInfoToComment(
    comment: CommentWithOrWithoutPostInfo,
    userId: string | null,
  ) {
    const likes = await this.prisma.commentLikeStatus.count({
      where: commentReactionQueryFilter(comment.id, 'Like'),
    });
    const dislikes = await this.prisma.commentLikeStatus.count({
      where: commentReactionQueryFilter(comment.id, 'Dislike'),
    });
    let myStatus: reactionStatusEnumKeys = 'None';
    if (userId) {
      const userReactionStatus = await this.prisma.commentLikeStatus.findFirst({
        where: userCommentStatusQueryFilter(comment.id, userId),
      });
      if (userReactionStatus) myStatus = userReactionStatus.likeStatus;
    }

    if (determineCommentType(comment)) {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.user!.login,
        },
        createdAt: comment.createdAt,
        postInfo: {
          id: comment.postId,
          title: comment.post?.title,
          blogId: comment.post?.blogId,
          blogName: comment.post?.blog.name,
        },
        likesInfo: {
          likesCount: likes,
          dislikesCount: dislikes,
          myStatus: myStatus,
        },
      };
    }
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user!.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likes,
        dislikesCount: dislikes,
        myStatus: myStatus,
      },
    };
  }
}
