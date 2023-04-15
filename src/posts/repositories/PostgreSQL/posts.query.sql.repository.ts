import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostModel, PostDbModel, PostViewModel } from '../../types';
import { PostReactionViewModel } from '../../../helpers/reaction/reaction.view.model.wrapper';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
@Injectable()
export class PostsQuerySqlRepository {
  constructor(private prisma: PrismaService) {}
  // async getMappedPost(post: CreatePostModel) {
  //
  // }
  async findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    userId: string | null,
    blogId?: string,
  ) {
    const posts: PostDbModel[] = await this.prisma.post.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: {
        blogId: {
          contains: blogId ?? '',
        },
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        createdAt: true,
        blogId: true,
        blog: {
          select: {
            name: true,
          },
        },
      },
    });
    const numberOfPosts = await this.prisma.post.count({
      where: {
        blogId: {
          contains: blogId ?? '',
        },
      },
    });
    const postsWithLikesInfo = posts.map((post) => {
      return new PostReactionViewModel(post);
    });
    return new PaginationViewModel<PostViewModel[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      postsWithLikesInfo,
    );
  }
}
