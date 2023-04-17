import { Injectable } from '@nestjs/common';
import { CreateCommentForPostDto } from '../../../posts/dto/createCommentForPost.dto';
import { CommentDbModel } from '../../index';

@Injectable()
export abstract class CommentsRepositoryAdapter {
  abstract createCommentForPost(
    userId: string,
    postId: string,
    createCommentForPostDto: CreateCommentForPostDto,
  ): Promise<CommentDbModel>;
}
