import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Model } from 'mongoose';
import { PrismaService } from '../../../prisma/prisma.service';
import { User as UserModel } from '@prisma/client';
import { UserViewModel } from '../../types/user.view.model';
import { CreateUserDto } from '../../dto/create.user.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
@Injectable()
export class UsersSQLRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private prisma: PrismaService,
  ) {}
  // async save(user: UserDocument): Promise<string> {
  //   await user.save();
  //   return user.id;
  // }
  async createUser(
    createUserDto: CreateUserDto,
    hash: string,
  ): Promise<UserViewModel> {
    return this.prisma.user.create({
      data: {
        login: createUserDto.login,
        email: createUserDto.email,
        hash: hash,
        createdAt: new Date().toISOString(),
        banInfo: {
          create: {},
        },
        emailConfirmation: {
          create: {
            confirmationCode: randomUUID(),
            expirationDate: add(new Date(), {
              minutes: 1,
            }).toISOString(),
            isConfirmed: false,
          },
        },
        passwordRecovery: { create: {} },
      },
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
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async clearUsers() {
    return this.userModel.deleteMany({});
  }
  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }
  async findUserByLogin(login: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { login: login } });
  }
  async findUserByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    });
  }
  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }
  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });
  }
}
