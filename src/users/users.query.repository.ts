import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { UsersPaginationQueryDto } from '../helpers/pagination/dto/users.pagination.query.dto';
import { PaginationViewModel } from '../helpers/pagination/pagination.view.model.wrapper';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUsers(
    usersPaginationDto: UsersPaginationQueryDto,
  ): Promise<PaginationViewModel<User[]>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortDirection,
      sortBy,
    } = usersPaginationDto;
    const filter: FilterQuery<User> = {
      $or: [
        {
          'accountData.login': {
            $regex: searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };
    const users: User[] = await this.userModel
      .find(filter, { _id: false, 'accountData.passwordHash': false })
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const numberOfUsers = await this.userModel.countDocuments(filter);
    return new PaginationViewModel(numberOfUsers, pageNumber, pageSize, users);
  }
}
