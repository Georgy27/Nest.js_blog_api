import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto } from '../../dto/create.post.dto';
import { Post, PostLikeStatus } from '@prisma/client';
import { CreatePostModel, PostWithBloggerId } from '../../types';
import { UpdatePostForBloggerDto } from '../../../blogs/dto/update.post.blogger.dto';
import { UpdateReactionPostDto } from '../../dto/update-reaction-post.dto';
import { PostsRepositoryAdapter } from '../adapters/posts-repository.adapter';

@Injectable()
export class PostsSqlRepository extends PostsRepositoryAdapter {
  constructor(private prisma: PrismaService) {
    super();
  }
  public async createPostForSpecifiedBlog(
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
  public async findPostById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({ where: { id } });
  }
  public async findPostWithBloggerIdById(
    id: string,
  ): Promise<PostWithBloggerId | null> {
    return this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        createdAt: true,
        blog: {
          select: {
            bloggerId: true,
          },
        },
      },
    });
  }
  public async updatePostById(
    id: string,
    updatePostForBloggerDto: UpdatePostForBloggerDto,
  ): Promise<Post> {
    try {
      return this.prisma.post.update({
        where: { id },
        data: {
          title: updatePostForBloggerDto.title,
          content: updatePostForBloggerDto.content,
          shortDescription: updatePostForBloggerDto.shortDescription,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  public async deletePostById(id: string): Promise<Post> {
    try {
      return this.prisma.post.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async findReactionToPost(
    userId: string,
    postId: string,
  ): Promise<PostLikeStatus | null> {
    return this.prisma.postLikeStatus.findFirst({
      where: {
        userId,
        postId,
      },
    });
  }

  public async createReactionToPost(
    userId: string,
    postId: string,
    updateReactionPostDto: UpdateReactionPostDto,
  ): Promise<PostLikeStatus> {
    try {
      return this.prisma.postLikeStatus.create({
        data: {
          likeStatus: updateReactionPostDto.likeStatus,
          userId,
          postId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async updateReactionToPost(
    id: string,
    updateReactionPostDto: UpdateReactionPostDto,
  ): Promise<PostLikeStatus> {
    try {
      return this.prisma.postLikeStatus.update({
        where: { id },
        data: {
          likeStatus: updateReactionPostDto.likeStatus,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async deleteAll() {
    return this.prisma.post.deleteMany({});
  }
}
