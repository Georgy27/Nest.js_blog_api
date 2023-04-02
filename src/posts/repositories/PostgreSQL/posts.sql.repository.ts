import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto } from '../../dto/create.post.dto';
import { Post } from '@prisma/client';
import { CreatePostModel } from '../../types';

@Injectable()
export class PostsSqlRepository {
  constructor(private prisma: PrismaService) {}
  async createPostForSpecifiedBlog(
    createPostDto: CreatePostDto,
  ): Promise<CreatePostModel> {
    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
        createdAt: new Date().toISOString(),
        blogId: createPostDto.blogId,
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        createdAt: true,
        blog: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
