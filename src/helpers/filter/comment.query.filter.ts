export const commentsQueryFilter = function (postId: string) {
  return {
    AND: [
      {
        postId,
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

export const commentQueryFilter = function (id: string) {
  return {
    AND: [
      {
        id,
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
