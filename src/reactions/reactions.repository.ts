import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionDocument } from './schemas/reaction.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReactionsRepository {
  constructor(
    @InjectModel(Reaction.name) private reactionsModel: Model<ReactionDocument>,
  ) {}
  async updateReaction(newReaction: Reaction): Promise<Reaction> {
    const filter = {
      // id: newReaction.id,
      parentId: newReaction.parentId,
      userId: newReaction.userId,
    };
    return this.reactionsModel
      .findOneAndUpdate(filter, newReaction, { upsert: true, new: true })
      .lean();
  }
  async dropReactions() {
    await this.reactionsModel.deleteMany({});
  }
  async updateUserBanStatus(userId: string, isBanned: boolean) {
    return this.reactionsModel.updateMany(
      { userId },
      { $set: { isUserBanned: isBanned } },
    );
  }
}
