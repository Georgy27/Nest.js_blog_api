export const postQueryFilter = function (id: string) {
  return {
    id,
    blog: {
      bannedBlogs: {
        isBanned: false,
      },
      blogger: {
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    },
  };
};

export const postsQueryFilter = function (blogId: string | undefined) {
  return {
    blogId,
    blog: {
      bannedBlogs: {
        isBanned: false,
      },
      blogger: {
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    },
  };
};
