import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CommentsQuerySqlRepository {
  constructor(private readonly prisma: PrismaService) {}
}
