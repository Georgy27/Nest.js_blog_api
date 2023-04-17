import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommentsQueryRepositoryAdapter } from '../adapters/comments-query-repository.adapter';
import { PostPaginationQueryDto } from '../../../helpers/pagination/dto/posts.pagination.query.dto';

import { reactionStatusEnumKeys } from '../../../helpers/reaction';
import { reactionQueryFilter } from '../../../helpers/filter/reaction.query.filter';
import { userStatusQueryFilter } from '../../../helpers/filter/user-status.query.filter';
import { CommentDbModel, CommentViewModel } from '../../index';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';

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

    const commentsFilter = {
      AND: [
        {
          postId: {
            contains: postId,
          },
        },
        {
          user: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      ],
    };
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

  private async addReactionsInfoToComment(
    comment: CommentDbModel,
    userId: string | null,
  ): Promise<CommentViewModel> {
    const likes = await this.prisma.commentLikeStatus.count({
      where: reactionQueryFilter(comment.id, 'Like'),
    });
    const dislikes = await this.prisma.commentLikeStatus.count({
      where: reactionQueryFilter(comment.id, 'Dislike'),
    });
    let myStatus: reactionStatusEnumKeys = 'None';
    if (userId) {
      const userReactionStatus = await this.prisma.commentLikeStatus.findFirst({
        where: userStatusQueryFilter(comment.id, userId),
      });
      if (userReactionStatus) myStatus = userReactionStatus.likeStatus;
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
