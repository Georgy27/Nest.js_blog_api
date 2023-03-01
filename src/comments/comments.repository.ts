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
    console.log(comment);
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
    return this.commentModel.findOne({ id }, { postId: false });
  }
  async deleteComment(id: string): Promise<boolean> {
    const result = await this.commentModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async updateUserBanStatus(userId: string, isBanned: boolean) {
    return this.commentModel.updateMany(
      { userId },
      { $set: { 'commentatorInfo.isUserBanned': isBanned } },
    );
  }
}
