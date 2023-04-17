export const reactionQueryFilter = function (
  commentId: string,
  status: 'Like' | 'Dislike',
) {
  return {
    AND: [
      {
        commentId: commentId,
      },
      {
        likeStatus: status,
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
};
