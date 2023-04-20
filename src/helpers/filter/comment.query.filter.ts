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

export const allCommentsForAllPostsQueryFilter = function (userId: string) {
  return {
    AND: [
      {
        post: {
          blog: {
            bloggerId: userId,
            bannedBlogs: {
              isBanned: false,
            },
          },
        },
      },
      {
        user: {
          banInfo: {
            isBanned: false,
          },
          bannedUsers: {
            none: {
              bloggerId: userId,
            },
          },
        },
      },
    ],
  };
};
