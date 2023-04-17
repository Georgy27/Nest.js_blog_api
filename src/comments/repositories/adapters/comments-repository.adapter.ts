import { Injectable } from '@nestjs/common';
import { CreateCommentForPostDto } from '../../../posts/dto/createCommentForPost.dto';
import { CreateCommentDbModel } from '../../index';

@Injectable()
export abstract class CommentsRepositoryAdapter {
  abstract createCommentForPost(
    userId: string,
    postId: string,
    createCommentForPostDto: CreateCommentForPostDto,
  ): Promise<CreateCommentDbModel>;
}
