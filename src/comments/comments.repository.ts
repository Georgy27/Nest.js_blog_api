import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async save(comment: CommentDocument): Promise<string> {
    await comment.save();
    return comment.id;
  }
  async clearComments() {
    await this.commentModel.deleteMany({});
  }
  async createComment(comment: Comment): Promise<string> {
    const newComment = await this.commentModel.create({ ...comment });
    return newComment.id;
  }
  async findComment(id: string): Promise<CommentDocument | null> {
    return this.commentModel.findOne({ id }, { _id: false, postId: false });
  }
  async delete(comment: CommentDocument): Promise<string> {
    await comment.delete();
    return comment.id;
  }
}
