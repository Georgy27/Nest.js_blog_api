import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommentsRepositoryAdapter } from '../adapters/comments-repository.adapter';
import { CreateCommentForPostDto } from '../../../posts/dto/createCommentForPost.dto';
import { CommentDbModel } from '../../index';
import { commentQueryFilter } from '../../../helpers/filter/comment.query.filter';
import { Comment, CommentLikeStatus } from '@prisma/client';
import { UpdateReactionCommentDto } from '../../dto/update-reaction-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

@Injectable()
export class CommentsSqlRepository extends CommentsRepositoryAdapter {
  public constructor(private readonly prisma: PrismaService) {
    super();
  }
  public async createCommentForPost(
    userId: string,
    postId: string,
    createCommentForPostDto: CreateCommentForPostDto,
  ): Promise<CommentDbModel> {
    try {
      return this.prisma.comment.create({
        data: {
          content: createCommentForPostDto.content,
          createdAt: new Date().toISOString(),
          postId: postId,
          userId: userId,
        },
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async updateCommentById(
    id: string,
    content: string,
  ): Promise<Comment> {
    try {
      return this.prisma.comment.update({
        where: { id },
        data: {
          content: content,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  public async findCommentById(id: string): Promise<Comment | null> {
    const commentFilter = commentQueryFilter(id);
    return this.prisma.comment.findFirst({ where: commentFilter });
  }

  public async findReactionToComment(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeStatus | null> {
    return this.prisma.commentLikeStatus.findFirst({
      where: {
        userId,
        commentId,
      },
    });
  }

  public async createReactionToComment(
    userId: string,
    commentId: string,
    updateReactionCommentDto: UpdateReactionCommentDto,
  ): Promise<CommentLikeStatus> {
    try {
      return this.prisma.commentLikeStatus.create({
        data: {
          likeStatus: updateReactionCommentDto.likeStatus,
          userId,
          commentId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async updateReactionToComment(
    id: string,
    updateReactionCommentDto: UpdateReactionCommentDto,
  ): Promise<CommentLikeStatus> {
    try {
      return this.prisma.commentLikeStatus.update({
        where: { id },
        data: {
          likeStatus: updateReactionCommentDto.likeStatus,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
