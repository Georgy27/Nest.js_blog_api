import { Injectable } from '@nestjs/common';
import { CreateCommentForPostDto } from '../../../posts/dto/createCommentForPost.dto';
import { CommentDbModel } from '../../index';
import { Comment, CommentLikeStatus } from '@prisma/client';
import { UpdateReactionCommentDto } from '../../dto/update-reaction-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

@Injectable()
export abstract class CommentsRepositoryAdapter {
  public abstract createCommentForPost(
    userId: string,
    postId: string,
    createCommentForPostDto: CreateCommentForPostDto,
  ): Promise<CommentDbModel>;

  public abstract findCommentById(id: string): Promise<Comment | null>;
  public abstract findReactionToComment(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeStatus | null>;

  public abstract createReactionToComment(
    userId: string,
    commentId: string,
    updateReactionCommentDto: UpdateReactionCommentDto,
  ): Promise<CommentLikeStatus>;

  public abstract updateReactionToComment(
    id: string,
    updateReactionCommentDto: UpdateReactionCommentDto,
  ): Promise<CommentLikeStatus>;

  public abstract updateCommentById(
    id: string,
    content: string,
  ): Promise<Comment>;
}
