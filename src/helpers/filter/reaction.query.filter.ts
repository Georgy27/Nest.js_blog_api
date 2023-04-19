export const commentReactionQueryFilter = function (
  commentId: string,
  status: 'Like' | 'Dislike',
) {
  return {
    commentId,
    likeStatus: status,
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

export const postReactionQueryFilter = function (
  postId: string,
  status: 'Like' | 'Dislike',
) {
  return {
    postId,
    likeStatus: status,
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
