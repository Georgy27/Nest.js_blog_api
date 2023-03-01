import { Injectable } from '@nestjs/common';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import { Post, PostDocument } from './schemas/post.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostReactionViewModel } from '../helpers/reaction/reaction.view.model.wrapper';
import {
  reactionStatusEnum,
  reactionStatusEnumKeys,
} from '../helpers/reaction';
import {
  Reaction,
  ReactionDocument,
} from '../reactions/schemas/reaction.schema';
import { PostViewModel } from './index';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
  ) {}

  async findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    userId: string | null,
    blogId?: string,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const filter: FilterQuery<Post> = {
      blogId: {
        $regex: blogId ?? '',
        $options: 'i',
      },
      isUserBanned: false,
    };

    const posts: Post[] = await this.postModel
      .find(filter, { isUserBanned: false })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const postsWithLikesInfo = await Promise.all(
      posts.map(async (post) => {
        return this.addReactionsInfoToPost(post, userId);
      }),
    );
    const numberOfPosts = await this.postModel.countDocuments(filter);

    return new PaginationViewModel<PostViewModel[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      postsWithLikesInfo,
    );
  }

  async findPost(
    id: string,
    userId: string | null,
  ): Promise<PostReactionViewModel | null> {
    const newPost: Post = await this.postModel
      .findOne({ id, isUserBanned: false }, { _id: false, isUserBanned: false })
      .lean();
    if (!newPost) return null;
    return this.addReactionsInfoToPost(newPost, userId);
  }
  async getMappedPost(id: string): Promise<PostViewModel | null> {
    const post = await this.postModel
      .findOne({ id, isUserBanned: false }, { _id: false, isUserBanned: false })
      .lean();
    if (!post) return null;
    return new PostReactionViewModel(post);
  }
  private async addReactionsInfoToPost(post: Post, userId: string | null) {
    const likes = await this.reactionModel.countDocuments({
      parentId: post.id,
      status: reactionStatusEnum.Like,
      isUserBanned: false,
    });
    const dislikes = await this.reactionModel.countDocuments({
      parentId: post.id,
      status: reactionStatusEnum.Dislike,
      isUserBanned: false,
    });
    const newestLikes = await this.reactionModel
      .find({
        parentId: post.id,
        status: reactionStatusEnum.Like,
        isUserBanned: false,
      })
      .sort({
        addedAt: 'desc',
      })
      .limit(3);
    const mappedNewestLikes = newestLikes.map((likes) => {
      return {
        addedAt: likes.addedAt,
        userId: likes.userId,
        login: likes.userLogin,
      };
    });
    let myStatus: reactionStatusEnumKeys = 'None';
    if (userId) {
      const reactionStatus = await this.reactionModel.findOne(
        {
          parentId: post.id,
          userId: userId,
          isUserBanned: false,
        },
        { _id: false },
      );
      if (reactionStatus) myStatus = reactionStatus.status;
    }
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likes,
        dislikesCount: dislikes,
        myStatus: myStatus,
        newestLikes: mappedNewestLikes,
      },
    };
  }
}
