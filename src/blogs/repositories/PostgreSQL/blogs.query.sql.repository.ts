import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAtPayload } from '../../../auth/strategies';
import { blogQueryFilter } from '../../../helpers/filter/blog.query.filter';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { BlogViewModel, BlogWithBannInfoModel } from '../../types';
import { UsersBannedByBloggerPaginationQueryDto } from '../../../helpers/pagination/dto/users-banned-by-blogger.pagination.query.dto';
import { Blog } from '@prisma/client';

@Injectable()
export class BlogsSQLQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBlogs(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const blogFilter = blogQueryFilter(searchNameTerm);

    const blogs = await this.prisma.blog.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: blogFilter,
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });
    const numberOfBlogs = await this.prisma.blog.count({ where: blogFilter });
    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }

  async findBlog(id: string) {
    return this.prisma.blog.findFirst({
      where: {
        AND: [
          {
            id,
          },
          {
            bannedBlogs: {
              isBanned: false,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });
  }
  async findBlogsForBlogger(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    jwtAtPayload?: JwtAtPayload,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const blogFilter = blogQueryFilter(searchNameTerm, jwtAtPayload?.userId);

    const blogs = await this.prisma.blog.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: blogFilter,
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });
    const numberOfBlogs = await this.prisma.blog.count({ where: blogFilter });

    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }

  async findBlogsForSuperAdmin(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
  ) {
    const blogs = await this.prisma.blog.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: {
        name: {
          contains: searchNameTerm ?? '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
        bannedBlogs: {
          select: {
            isBanned: true,
            banDate: true,
          },
        },
        blogger: {
          select: {
            user: {
              select: {
                id: true,
                login: true,
              },
            },
          },
        },
      },
    });
    const mappedViewBlogs = blogs.map((blog) => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.blogger.user.id,
          userLogin: blog.blogger.user.login,
        },
        banInfo: {
          isBanned: blog.bannedBlogs?.isBanned,
          banDate: blog.bannedBlogs?.banDate,
        },
      };
    });
    const numberOfBlogs = await this.prisma.blog.count({
      where: {
        name: {
          contains: searchNameTerm ?? '',
          mode: 'insensitive',
        },
      },
    });
    return new PaginationViewModel(
      numberOfBlogs,
      pageNumber,
      pageSize,
      mappedViewBlogs,
    );
  }
}
