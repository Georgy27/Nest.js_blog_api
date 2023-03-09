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
    let filter: FilterQuery<Blog> = blogQueryFilter(
      searchNameTerm,
      jwtAtPayload ? jwtAtPayload.userId : undefined,
    );
    filter = { ...filter, 'banInfo.isBanned': false };

    const blogs = await this.blogModel
      .find(filter, {
        _id: false,
        __v: false,
        blogOwnerInfo: false,
        bannedUsersInfo: false,
        banInfo: false,
      })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfBlogs = await this.blogModel.countDocuments(filter);
    return new PaginationViewModel(numberOfBlogs, pageNumber, pageSize, blogs);
  }
  async findBlogsWithoutPagination(userId: string) {
    return this.blogModel.find({
      'blogOwnerInfo.userId': {
        $regex: userId ?? '',
      },
      'banInfo.isBanned': false,
    });
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
      .find(filter, {
        _id: false,
        __v: false,
        bannedUsersInfo: false,
      })
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
        { id, 'banInfo.isBanned': false },
        {
          _id: false,
          __v: false,
          blogOwnerInfo: false,
          bannedUsersInfo: false,
          banInfo: false,
        },
      )
      .lean();
  }
  // async findBlogByUserId(userId: string) {
  //   return this.blogModel.findOne(
  //     { 'blogOwnerInfo.userId': userId },
  //     {
  //       _id: false,
  //       __v: false,
  //       blogOwnerInfo: false,
  //       bannedUsersInfo: false,
  //       banInfo: false,
  //     },
  //   );
  // }

  async getBannedUsersForBlog(
    blog: Blog,
    usersBannedByBloggerPaginationDto: UsersBannedByBloggerPaginationQueryDto,
  ) {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } =
      usersBannedByBloggerPaginationDto;
    const sortArg = 'bannedUsersInfo.'.concat(sortBy);
    const bannedUsers = await this.blogModel.aggregate([
      {
        $match: {
          id: blog.id,
          'banInfo.isBanned': false,
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
            $regex: searchLoginTerm ?? '',
            $options: 'i',
          },
        },
      },
      {
        $sort: {
          [sortArg]: sortDirection === 'asc' ? 1 : -1,
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
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
          // totalCount: { $sum: 2 },
        },
      },
    ]);

    // const countBannedUsers = await this.blogModel.countDocuments({
    //   id: blog.id,
    //   'banInfo.isBanned': false,
    //   login: {
    //     $in: {
    //       bannedUsersInfo: {
    //         $regex: searchLoginTerm ?? '',
    //         $options: 'i',
    //       },
    //     },
    //   },
    // });
    const countBannedUsers: { totalCount: number }[] =
      await this.blogModel.aggregate([
        {
          $match: {
            id: blog.id,
            'banInfo.isBanned': false,
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
              $regex: searchLoginTerm ?? '',
              $options: 'i',
            },
          },
        },
        { $count: 'totalCount' },
      ]);
    const totalCount = countBannedUsers[0] ? countBannedUsers[0].totalCount : 0;

    return new PaginationViewModel(
      totalCount,
      pageNumber,
      pageSize,
      bannedUsers,
    );
  }
}
