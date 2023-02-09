import { Injectable } from '@nestjs/common';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import { Post, PostDocument } from './schemas/post.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostReactionViewModel } from '../helpers/reaction/reaction.view.model.wrapper';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    blogId?: string,
  ): Promise<PaginationViewModel<PostReactionViewModel[]>> {
    const filter: FilterQuery<Post> = {
      $regex: blogId ?? '',
      $options: 'i',
    };

    const posts: Post[] = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfPosts = await this.postModel.countDocuments(filter);
    const postsWithReactions = posts.map((post) => {
      return new PostReactionViewModel(post);
    });

    return new PaginationViewModel<PostReactionViewModel[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      postsWithReactions,
    );
  }
  async findPost(id: string): Promise<PostReactionViewModel | null> {
    const newPost: Post = await this.postModel
      .findOne({ id }, { _id: false })
      .lean();
    if (!newPost) return null;
    return new PostReactionViewModel(newPost);
  }
}
