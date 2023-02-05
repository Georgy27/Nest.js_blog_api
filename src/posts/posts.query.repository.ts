import { Injectable } from '@nestjs/common';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import { Post, PostDocument } from './schemas/post.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async findPosts(
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string | null,
    blogId?: string,
  ): Promise<PaginationViewModel<Post[]>> {
    const filter: FilterQuery<Post> = {
      $regex: blogId ?? '',
      $options: 'i',
    };

    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfPosts = await this.postModel.countDocuments(filter);
    return new PaginationViewModel<Post[]>(
      numberOfPosts,
      pageNumber,
      pageSize,
      posts,
    );
  }
}
