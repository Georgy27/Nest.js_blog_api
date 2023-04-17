import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommentsQueryRepositoryAdapter } from '../adapters/comments-query-repository.adapter';

@Injectable()
export class CommentsQuerySqlRepository extends CommentsQueryRepositoryAdapter {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
}
