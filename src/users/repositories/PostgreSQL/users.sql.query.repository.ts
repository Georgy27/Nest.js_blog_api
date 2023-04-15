import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersPaginationQueryDto } from '../../../helpers/pagination/dto/users.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { UserViewModel } from '../../types/user.view.model';
import { PrismaService } from '../../../prisma/prisma.service';
import { Model } from 'mongoose';
import { userQueryFilter } from '../../../helpers/filter/user.query.filter';
import { BlogWithBannInfoModel } from '../../../blogs/types';
import { UsersBannedByBloggerPaginationQueryDto } from '../../../helpers/pagination/dto/users-banned-by-blogger.pagination.query.dto';

@Injectable()
export class UsersSQLQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private prisma: PrismaService,
  ) {}

  async findUsers(
    usersPaginationDto: UsersPaginationQueryDto,
  ): Promise<PaginationViewModel<UserViewModel[]>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortDirection,
      sortBy,
      banStatus,
    } = usersPaginationDto;

    const banStatusFilterValue =
      banStatus === 'all' ? {} : banStatus === 'banned' ? true : false;

    const userFilter = userQueryFilter(
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    );

    const newUsers = await this.prisma.user.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: userFilter,
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
        banInfo: {
          select: {
            isBanned: true,
            banDate: true,
            banReason: true,
          },
        },
      },
    });
    const numberOfUsers = await this.prisma.user.count({ where: userFilter });

    return new PaginationViewModel(
      numberOfUsers,
      pageNumber,
      pageSize,
      newUsers,
    );
  }

  async findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async getBannedUsersForBlog(
    blog: BlogWithBannInfoModel,
    usersBannedByBloggerPaginationDto: UsersBannedByBloggerPaginationQueryDto,
  ) {
    const { sortBy, pageNumber, sortDirection, pageSize, searchLoginTerm } =
      usersBannedByBloggerPaginationDto;

    const allBannedUsers = await this.prisma.bannedUsers.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
      where: {
        blogId: blog.id,
        login: { contains: searchLoginTerm ?? '', mode: 'insensitive' },
      },
    });

    const mappedBannedUsers = allBannedUsers.map((bannedUser) => {
      return {
        id: bannedUser.userId,
        login: bannedUser.login,
        banInfo: {
          isBanned: bannedUser.isBanned,
          banDate: bannedUser.banDate,
          banReason: bannedUser.banReason,
        },
      };
    });
    const numberOfBannedUsers = await this.prisma.bannedUsers.count({
      where: {
        blogId: blog.id,
        login: { contains: searchLoginTerm ?? '', mode: 'insensitive' },
      },
    });
    return new PaginationViewModel(
      numberOfBannedUsers,
      pageNumber,
      pageSize,
      mappedBannedUsers,
    );
  }
}
