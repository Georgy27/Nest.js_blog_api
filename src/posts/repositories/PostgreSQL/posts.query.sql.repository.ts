import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostModel } from '../../types';
@Injectable()
export class PostsQuerySqlRepository {
  constructor(private prisma: PrismaService) {}
  // async getMappedPost(post: CreatePostModel) {
  //
  // }
}
