import {
  CommentWithOrWithoutPostInfo,
  CommentWithPostInfoDbModel,
} from '../index';

export function determineCommentType(
  toBeDetermined: CommentWithOrWithoutPostInfo,
): toBeDetermined is CommentWithPostInfoDbModel {
  if ((toBeDetermined as CommentWithPostInfoDbModel).post) {
    return true;
  }
  return false;
}
