import { reactionStatusEnumKeys } from '../helpers/reaction';

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

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo;
};
