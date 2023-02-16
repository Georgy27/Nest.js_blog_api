import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async save(user: UserDocument): Promise<string> {
    await user.save();
    return user.id;
  }
  async createUser(user: User): Promise<User> {
    return this.userModel.create({ ...user });
  }
  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async clearUsers() {
    return this.userModel.deleteMany({});
  }
  async findUserByLogin(login: string): Promise<User | null> {
    return this.userModel.findOne({ 'accountData.login': login });
  }
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 'accountData.email': email });
  }
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [
          { 'accountData.email': loginOrEmail },
          { 'accountData.login': loginOrEmail },
        ],
      })
      .lean();
  }
  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }
}
