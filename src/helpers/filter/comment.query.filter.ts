export const commentsQueryFilter = function (postId: string) {
  return {
    postId,
    user: {
      banInfo: {
        isBanned: false,
      },
    },
    post: {
      blog: {
        bannedBlogs: {
          isBanned: false,
        },
      },
    },
  };
};

export const commentQueryFilter = function (id: string) {
  return {
    id,
    user: {
      banInfo: {
        isBanned: false,
      },
    },
    post: {
      blog: {
        bannedBlogs: {
          isBanned: false,
        },
      },
    },
  };
};
