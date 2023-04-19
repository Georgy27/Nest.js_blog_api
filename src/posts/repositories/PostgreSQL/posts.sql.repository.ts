import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto } from '../../dto/create.post.dto';
import { CommentLikeStatus, Post, PostLikeStatus } from '@prisma/client';
import { CreatePostModel } from '../../types';
import { UpdatePostForBloggerDto } from '../../../blogs/dto/update.post.blogger.dto';
import { UpdateReactionCommentDto } from '../../../comments/dto/update-reaction-comment.dto';
import { UpdateReactionPostDto } from '../../dto/update-reaction-post.dto';

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
  async findPostById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({ where: { id } });
  }
  async findPostWithBloggerIdById(id: string) {
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
  async updatePostById(
    id: string,
    updatePostForBloggerDto: UpdatePostForBloggerDto,
  ) {
    return this.prisma.post.update({
      where: { id },
      data: {
        title: updatePostForBloggerDto.title,
        content: updatePostForBloggerDto.content,
        shortDescription: updatePostForBloggerDto.shortDescription,
      },
    });
  }
  async deletePostById(id: string) {
    return this.prisma.post.delete({ where: { id } });
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
}
