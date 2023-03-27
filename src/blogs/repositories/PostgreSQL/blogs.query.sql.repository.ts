import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAtPayload } from '../../../auth/strategies';
import { blogQueryFilter } from '../../../helpers/filter/blog.query.filter';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { BlogViewModel } from '../../types';

@Injectable()
export class BlogsSQLQueryRepository {
  constructor(private readonly prisma: PrismaService) {}
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
}
