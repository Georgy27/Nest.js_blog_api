import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersPaginationQueryDto } from '../../../helpers/pagination/dto/users.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { UserViewModel } from '../../types/user.view.model';
import { PrismaService } from '../../../prisma/prisma.service';
import { Model } from 'mongoose';
import { userQueryFilter } from '../../../helpers/filter/user.query.filter';

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

  async findUser(id: string): Promise<UserViewModel> {
    const user: User = await this.userModel
      .findOne({ id }, { _id: false, 'accountData.passwordHash': false })
      .lean();

    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }
}
