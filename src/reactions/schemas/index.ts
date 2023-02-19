export enum reactionStatusEnum {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}
export type reactionStatusEnumKeys = keyof typeof reactionStatusEnum;
export interface ReactionsInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: reactionStatusEnumKeys;
}
