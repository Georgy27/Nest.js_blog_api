import { extendedLikesInfo } from './types/posts.reaction.query';
import { CreatePostModel } from '../../posts/types';

export class PostReactionViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfo;

  constructor(post: CreatePostModel) {
    this.id = post.id;
    this.title = post.title;
    this.shortDescription = post.shortDescription;
    this.content = post.content;
    this.blogId = post.blogId;
    this.blogName = post.blog.name;
    this.createdAt = post.createdAt;
    this.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
  }
}
