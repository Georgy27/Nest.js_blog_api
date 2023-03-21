import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import {
  BanInfo,
  EmailConfirmation,
  PasswordRecovery,
  User as UserModel,
} from '@prisma/client';
import { UserViewModel } from '../../types/user.view.model';
import { CreateUserDto } from '../../dto/create.user.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import {
  UserWithEmailConfirmation,
  UserWithPasswordRecoveryInfo,
} from '../../../auth/types';
@Injectable()
export class UsersSQLRepository {
  constructor(private prisma: PrismaService) {}

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
          create: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
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
  async updateUserBanInfoByAdmin(
    userId: string,
    updateBanInfo: any,
  ): Promise<BanInfo> {
    return this.prisma.banInfo.update({
      where: { userId: userId },
      data: {
        isBanned: updateBanInfo.isBanned,
        banDate: updateBanInfo.banDate,
        banReason: updateBanInfo.banReason,
      },
    });
  }
  async getEmailConfirmationCode(
    userEmail: string,
  ): Promise<EmailConfirmation | null> {
    return this.prisma.emailConfirmation.findUnique({
      where: { userEmail: userEmail },
    });
  }
  async updateEmailConfirmationCode(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: { isConfirmed: true },
    });
  }
  async updateEmailConfirmationInfo(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 1,
        }).toISOString(),
      },
    });
  }
  async updatePasswordRecoveryInfo(userId: string): Promise<PasswordRecovery> {
    return this.prisma.passwordRecovery.update({
      where: { userId },
      data: {
        recoveryCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 1 }).toISOString(),
      },
    });
  }
  async clearRecoveryAndExpirationDate(userId: string) {
    return this.prisma.passwordRecovery.update({
      where: { userId },
      data: {
        recoveryCode: null,
        expirationDate: null,
      },
    });
  }
  async updateUserHash(id: string, hash: string): Promise<UserModel> {
    return this.prisma.user.update({ where: { id }, data: { hash } });
  }
  async deleteUserById(id: string) {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
  async findUserByLogin(login: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { login: login } });
  }
  async findUserByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }
  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {
            login: loginOrEmail,
          },
          {
            email: loginOrEmail,
          },
        ],
      },
      include: {
        banInfo: {
          select: {
            isBanned: true,
          },
        },
      },
    });
  }
  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<UserWithEmailConfirmation | null> {
    return this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          confirmationCode: code,
        },
      },
      include: {
        emailConfirmation: {
          select: {
            confirmationCode: true,
            expirationDate: true,
            isConfirmed: true,
          },
        },
      },
    });
  }
  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserWithPasswordRecoveryInfo | null> {
    return this.prisma.user.findFirst({
      where: {
        passwordRecovery: {
          recoveryCode: code,
        },
      },
      include: {
        passwordRecovery: {
          select: {
            recoveryCode: true,
            expirationDate: true,
          },
        },
      },
    });
  }
  async clearUsers() {
    return this.prisma.user.deleteMany({});
  }
}
