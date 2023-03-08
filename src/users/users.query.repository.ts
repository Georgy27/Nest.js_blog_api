import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { UsersPaginationQueryDto } from '../helpers/pagination/dto/users.pagination.query.dto';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';
import { userQueryFilter } from '../helpers/filter/user.query.filter';
import { UserViewModel } from './types/user.view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

    const filter: FilterQuery<User> = userQueryFilter(
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    );

    const sortArg = 'accountData.'.concat(sortBy);

    const users: User[] = await this.userModel
      .find(filter, { _id: false, 'accountData.passwordHash': false })
      .sort({ [sortArg]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const newUsers = users.map((user) => {
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
    });
    const numberOfUsers = await this.userModel.countDocuments(filter);
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
