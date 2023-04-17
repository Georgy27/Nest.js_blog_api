import { CommentViewModel, CommentDbModel } from '../index';

export const getMappedComment = function (
  comment: CommentDbModel,
): CommentViewModel {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.userId,
      userLogin: comment.user!.login,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    },
  };
};
