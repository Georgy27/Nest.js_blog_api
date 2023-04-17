export enum reactionStatusEnum {
  Like = 'like',
  Dislike = 'dislike',
  None = 'none',
}
export type reactionStatusEnumKeys = keyof typeof reactionStatusEnum;
