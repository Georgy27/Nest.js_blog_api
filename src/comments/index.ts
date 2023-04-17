import { ReactionsInfo } from '../reactions/schemas';
import { Comment } from '@prisma/client';

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: ReactionsInfo;
};

export interface CreateCommentDbModel extends Omit<Comment, 'postId'> {
  user: {
    login: string;
  } | null;
}
