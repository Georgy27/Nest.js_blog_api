import { extendedLikesInfo } from './types/posts.reaction.query';
import { Post } from '../../posts/schemas/post.schema';

export class PostReactionViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.shortDescription = post.shortDescription;
    this.content = post.content;
    this.blogId = post.blogId;
    this.blogName = post.blogName;
    this.createdAt = post.createdAt;
    this.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
  }
}
