import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { FilterQuery, Model } from 'mongoose';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import { JwtAtPayload } from '../auth/strategies';
import { blogQueryFilter } from '../helpers/filter/blog.query.filter';
import { UsersBannedByBloggerPaginationQueryDto } from '../helpers/pagination/dto/users-banned-by-blogger.pagination.query.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findBlogs(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
    jwtAtPayload?: JwtAtPayload,
  ): Promise<PaginationViewModel<Blog[]>> {
    const filter: FilterQuery<Blog> = blogQueryFilter(
      searchNameTerm,
      jwtAtPayload ? jwtAtPayload.userId : undefined,
    );
    const blogs = await this.blogModel
      .find(filter, {
        _id: false,
        __v: false,
        blogOwnerInfo: false,
        bannedUsersInfo: false,
      })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfBlogs = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }

  async findBlogsForSuperAdmin(
    searchNameTerm: string | null,
    pageSize: number,
    sortBy: string,
    pageNumber: number,
    sortDirection: string,
  ) {
    const filter = {
      name: {
        $regex: searchNameTerm ?? '',
        $options: 'i',
      },
    };
    const blogs = await this.blogModel
      .find(filter, { _id: false, __v: false, bannedUsersInfo: false })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfBlogs = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }

  async findBlog(id: string): Promise<Blog | null> {
    return this.blogModel
      .findOne(
        { id },
        {
          _id: false,
          __v: false,
          blogOwnerInfo: false,
          bannedUsersInfo: false,
        },
      )
      .lean();
  }

  async getBannedUsersForBlog(
    blog: Blog,
    usersBannedByBloggerPaginationDto: UsersBannedByBloggerPaginationQueryDto,
  ) {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } =
      usersBannedByBloggerPaginationDto;
    // aggregate
    // const bannedUsers = blog.bannedUsersInfo;
    const bannedUsers = await this.blogModel.aggregate([
      {
        $match: {
          id: '5305a9f0-868b-4f32-85d8-4d02faa03bb4',
        },
      },
      {
        $unwind: {
          path: '$bannedUsersInfo',
        },
      },
      {
        $match: {
          'bannedUsersInfo.login': {
            $regex: '4',
            $options: 'i',
          },
        },
      },
      {
        $project: {
          _id: false,
          id: '$bannedUsersInfo.id',
          login: '$bannedUsersInfo.login',
          banInfo: {
            isBanned: '$bannedUsersInfo.banInfo.isBanned',
            banDate: '$bannedUsersInfo.banInfo.banDate',
            banReason: '$bannedUsersInfo.banInfo.banReason',
          },
        },
      },
      {
        $sort: {
          'banInfo.banDate': 1,
        },
      },
      {
        $skip: 0,
      },
      {
        $limit: 10,
      },
    ]);
    console.log('bannedUsers', bannedUsers);
    const countBannedUsers = await this.blogModel.countDocuments(bannedUsers);
    console.log('countBannedUsers', countBannedUsers);
  }
}
