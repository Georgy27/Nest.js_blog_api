import { Injectable } from '@nestjs/common';
import { ReactionsRepository } from './reactions.repository';
import { reactionStatusEnumKeys } from '../helpers/reaction';
import { Reaction } from './schemas/reaction.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class ReactionsService {
  constructor(private readonly reactionsRepository: ReactionsRepository) {}
  async updateReaction(
    parentType: string,
    parentId: string,
    userId: string,
    userLogin: string,
    status: reactionStatusEnumKeys,
  ): Promise<Reaction> {
    const newReaction: Reaction = {
      id: randomUUID(),
      parentType: parentType,
      parentId,
      status,
      addedAt: new Date().toISOString(),
      userId,
      userLogin,
    };
    return this.reactionsRepository.updateReaction(newReaction);
  }
}
