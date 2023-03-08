import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import {
  Reaction,
  ReactionDocument,
} from '../reactions/schemas/reaction.schema';
import {
  reactionStatusEnum,
  reactionStatusEnumKeys,
} from '../helpers/reaction';
import { CommentViewModel } from './index';
import { CommentsPaginationQueryDto } from '../helpers/pagination/dto/comments.pagination.dto';
import { Post } from '../posts/schemas/post.schema';
import { Blog } from '../blogs/schemas/blog.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name) private reactionModel: Model<ReactionDocument>,
  ) {}
  async findCommentsByPostId(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    postId: string,
    userId: string | null,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const comments = await this.commentModel
      .find(
        { postId, 'commentatorInfo.isUserBanned': false },
        { _id: false, postId: false },
      )
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const commentsWithLikesInfo = await Promise.all(
      comments.map(async (comment) => {
        return this.addReactionsInfoToComment(comment, userId);
      }),
    );
    const numberOfComments = await this.commentModel.countDocuments({ postId });
    return new PaginationViewModel<CommentViewModel[]>(
      numberOfComments,
      pageNumber,
      pageSize,
      commentsWithLikesInfo,
    );
  }
  async getMappedComment(id: string): Promise<CommentViewModel | null> {
    const comment = await this.commentModel
      .findOne(
        { id, 'commentatorInfo.isUserBanned': false },
        { _id: false, postId: false },
      )
      .lean();
    if (!comment) return null;
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
  async getAllCommentsForAllPostsByBlogger(
    allPosts: Post[],
    allBlogs: Blog[],
    commentsForPostsPaginationDto: CommentsPaginationQueryDto,
    userId: string,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      commentsForPostsPaginationDto;

    const dictionary: Record<string, Post> = {};
    allPosts.forEach((post) => {
      const postId = post.id;
      dictionary[postId] = post;
    });

    const blogsBunnedUsersInfo = allBlogs.flatMap(
      (blog) => blog.bannedUsersInfo,
    );
    const filter = {
      postId: allPosts.map((post) => post.id),
      'commentatorInfo.isUserBanned': false,
      'commentatorInfo.userId': {
        $nin: blogsBunnedUsersInfo.map((user) => user.id),
      },
    };
    const comments = await this.commentModel
      .find(filter, {
        _id: false,
        'commentatorInfo.isUserBanned': false,
      })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const mappedComments = comments.map((comment) => {
      console.log(comment);
      const postId = comment.postId;
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        postInfo: {
          id: postId,
          title: dictionary[postId].title,
          blogId: dictionary[postId].blogId,
          blogName: dictionary[postId].blogName,
          content: dictionary[postId].content,
        },
      };
    });

    const numberOfComments = await this.commentModel.countDocuments(filter);
    return new PaginationViewModel(
      numberOfComments,
      pageNumber,
      pageSize,
      mappedComments,
    );
  }
  async findComment(id: string, userId: null | string) {
    const comment = await this.commentModel
      .findOne(
        { id, 'commentatorInfo.isUserBanned': false },
        { _id: false, postId: false },
      )
      .lean();
    console.log(comment);
    if (!comment) return null;
    return this.addReactionsInfoToComment(comment, userId);
  }
  private async addReactionsInfoToComment(
    comment: Comment,
    userId: string | null,
  ): Promise<CommentViewModel> {
    const likes = await this.reactionModel.countDocuments({
      parentId: comment.id,
      status: reactionStatusEnum.Like,
      isUserBanned: false,
    });
    const dislikes = await this.reactionModel.countDocuments({
      parentId: comment.id,
      status: reactionStatusEnum.Dislike,
      isUserBanned: false,
    });
    let myStatus: reactionStatusEnumKeys = 'None';
    if (userId) {
      const reactionStatus = await this.reactionModel.findOne(
        {
          parentId: comment.id,
          userId: userId,
          isUserBanned: false,
        },
        { _id: false },
      );
      if (reactionStatus) myStatus = reactionStatus.status;
    }
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likes,
        dislikesCount: dislikes,
        myStatus: myStatus,
      },
    };
  }
}
