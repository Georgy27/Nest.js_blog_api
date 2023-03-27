import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlogDto } from '../../dto/create.blog.dto';
import { JwtAtPayload } from '../../../auth/strategies';

@Injectable()
export class BlogsSqlRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createBlog(createBlogDto: CreateBlogDto, jwtAtPayload: JwtAtPayload) {
    return this.prisma.blog.create({
      data: {
        name: createBlogDto.name,
        description: createBlogDto.description,
        websiteUrl: createBlogDto.websiteUrl,
        createdAt: new Date().toISOString(),
        isMembership: false,
        bloggerId: jwtAtPayload.userId,
      },
      select: {
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });
  }
  async clearBlogs() {
    return this.prisma.blog.deleteMany({});
  }
}
