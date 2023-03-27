import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAtPayload } from '../../../auth/strategies';

@Injectable()
export class BlogsSQLQueryRepository {
  constructor(private readonly prisma: PrismaService) {}
  // async findBlogsForBlogger(
  //   searchNameTerm: string | null,
  //   pageSize: number,
  //   sortBy: string,
  //   pageNumber: number,
  //   sortDirection: string,
  //   jwtAtPayload?: JwtAtPayload,
  // ) {}
}
