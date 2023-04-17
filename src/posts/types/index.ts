import { reactionStatusEnumKeys } from '../../helpers/reaction';
import { Post } from '@prisma/client';

export interface extendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: reactionStatusEnumKeys;
  newestLikes: newestLikes[];
}
export interface newestLikes {
  addedAt: string;
  userId: string;
  login: string;
}
export interface CreatePostModel extends Post {
  blog: { name: string };
}

export interface PostDbModel extends Post {
  blog: {
    name: string;
  };
}

export interface PostViewModel extends Post {
  blogName: string;
}
