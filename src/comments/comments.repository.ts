import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async clearComments() {
    await this.commentModel.deleteMany({});
  }
  async createComment(comment: Comment): Promise<string> {
    const newComment = await this.commentModel.create({ ...comment });
    return newComment.id;
  }
}
