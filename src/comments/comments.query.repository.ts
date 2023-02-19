import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async findCommentsByPostId(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    postId: string,
  ): Promise<PaginationViewModel<Comment[]>> {
    const comments = await this.commentModel
      .find({ postId }, { _id: false, postId: false })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const numberOfComments = await this.commentModel.countDocuments({ postId });
    return new PaginationViewModel<Comment[]>(
      numberOfComments,
      pageNumber,
      pageSize,
      comments,
    );
  }
  async findComment(id: string): Promise<Comment | null> {
    return this.commentModel
      .findOne({ id }, { _id: false, postId: false })
      .lean();
  }
}
