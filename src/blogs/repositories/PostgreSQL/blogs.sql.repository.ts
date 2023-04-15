import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlogDto } from '../../dto/create.blog.dto';
import { JwtAtPayload } from '../../../auth/strategies';
import { BlogDocument } from '../../schemas/blog.schema';
import { Blog } from '@prisma/client';
import { UpdateBlogDto } from '../../dto/update.blog.dto';
import { BlogWithBannInfoModel } from '../../types';

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
        bannedBlogs: {
          create: {
            isBanned: false,
          },
        },
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
  async updateBlog(id: string, updateBlogDto: UpdateBlogDto): Promise<void> {
    try {
      await this.prisma.blog.update({
        where: { id },
        data: {
          name: updateBlogDto.name,
          description: updateBlogDto.description,
          websiteUrl: updateBlogDto.websiteUrl,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteBlog(id: string) {
    try {
      await this.prisma.blog.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findBlogById(id: string): Promise<BlogWithBannInfoModel | null> {
    return this.prisma.blog.findUnique({
      where: { id },
      include: {
        bannedBlogs: {
          select: {
            isBanned: true,
            banDate: true,
          },
        },
      },
    });
  }

  async updateBanBlogStatus(
    blogId: string,
    updateBlogBanInfo:
      | { isBanned: true; banDate: string }
      | { isBanned: false; banDate: null },
  ) {
    return this.prisma.bannedBlogs.update({
      where: { blogId },
      data: updateBlogBanInfo,
    });
  }
  async clearBlogs() {
    return this.prisma.blog.deleteMany({});
  }
}
