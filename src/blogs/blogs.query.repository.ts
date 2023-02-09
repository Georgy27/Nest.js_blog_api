import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { FilterQuery, Model } from 'mongoose';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async findBlogs(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
  ): Promise<PaginationViewModel<Blog[]>> {
    const filter: FilterQuery<Blog> = {
      name: {
        $regex: searchNameTerm ?? '',
        $options: 'i',
      },
    };
    console.log(filter);
    const blogs = await this.blogModel
      .find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfBlogs = await this.blogModel.countDocuments(filter);

    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }
  async findBlog(id: string): Promise<Blog | null> {
    return this.blogModel.findOne({ id }, { _id: false, __v: false }).lean();
  }
}
