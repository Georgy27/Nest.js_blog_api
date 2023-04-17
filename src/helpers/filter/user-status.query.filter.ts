export const userStatusQueryFilter = function (
  commentId: string,
  userId: string,
) {
  return {
    AND: [
      {
        commentId: commentId,
      },
      {
        userId: userId,
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
