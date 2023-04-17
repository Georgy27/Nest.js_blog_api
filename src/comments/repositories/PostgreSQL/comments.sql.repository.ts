import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommentsRepositoryAdapter } from '../adapters/comments-repository.adapter';
import { CreateCommentForPostDto } from '../../../posts/dto/createCommentForPost.dto';
import { CommentDbModel } from '../../index';

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
}
