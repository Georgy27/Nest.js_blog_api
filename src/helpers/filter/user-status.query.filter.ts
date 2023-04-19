export const userCommentStatusQueryFilter = function (
  commentId: string,
  userId: string,
) {
  return {
    commentId,
    userId,
    user: {
      banInfo: {
        isBanned: false,
      },
    },
  };
};

export const userPostStatusQueryFilter = function (
  postId: string,
  userId: string,
) {
  return {
    postId,
    userId,
    user: {
      banInfo: {
        isBanned: false,
      },
    },
    blog: {
      bannedBlogs: {
        isBanned: false,
      },
    },
  };
};
