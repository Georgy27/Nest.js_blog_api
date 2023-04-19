import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../dto/create.post.dto';
import { CreatePostModel, PostWithBloggerId } from '../../types';
import { Post, PostLikeStatus } from '@prisma/client';
import { UpdatePostForBloggerDto } from '../../../blogs/dto/update.post.blogger.dto';
import { UpdateReactionPostDto } from '../../dto/update-reaction-post.dto';
import { RepositoryAdapter } from '../../../common/adapters/repository.adapter';

@Injectable()
export abstract class PostsRepositoryAdapter extends RepositoryAdapter {
  public abstract createPostForSpecifiedBlog(
    createPostDto: CreatePostDto,
  ): Promise<CreatePostModel>;

  public abstract findPostById(id: string): Promise<Post | null>;

  public abstract findPostWithBloggerIdById(
    id: string,
  ): Promise<PostWithBloggerId | null>;

  public abstract updatePostById(
    id: string,
    updatePostForBloggerDto: UpdatePostForBloggerDto,
  ): Promise<Post>;

  public abstract deletePostById(id: string): Promise<Post>;

  public abstract findReactionToPost(
    userId: string,
    postId: string,
  ): Promise<PostLikeStatus | null>;

  public abstract createReactionToPost(
    userId: string,
    postId: string,
    updateReactionPostDto: UpdateReactionPostDto,
  ): Promise<PostLikeStatus>;

  public abstract updateReactionToPost(
    id: string,
    updateReactionPostDto: UpdateReactionPostDto,
  ): Promise<PostLikeStatus>;
}
