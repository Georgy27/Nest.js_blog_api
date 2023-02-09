import { reactionStatusEnumKeys } from '../index';

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
