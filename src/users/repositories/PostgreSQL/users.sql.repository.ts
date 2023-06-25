import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

import { UserViewModel } from '../../types/user.view.model';
import { CreateUserDto } from '../../dto/create.user.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import {
  UserWithEmailConfirmation,
  UserWithPasswordRecoveryInfo,
} from '../../../auth/types';
import { BanUserByBloggerDto } from '../../dto/ban.user.blogger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
@Injectable()
export class UsersSQLRepository {
  constructor(
    private prisma: PrismaService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async createUserTransaction(createUserDto: CreateUserDto, hash: string) {
    await this.entityManager.transaction(async (entityManager) => {
      const user = await this.userRepo.create({
        login: createUserDto.login,
        email: createUserDto.email,
        hash,
      });
    });
    // return this.userRepo.create({
    //   login: createUserDto.login,
    //   email: createUserDto.email,
    //   hash,
    //   emailConfirmation: {
    //     confirmationCode: randomUUID(),
    //     expirationDate: add(new Date(), {
    //       minutes: 1,
    //     }).toISOString(),
    //     isConfirmed: false,
    //   },
    //   banInfo: {
    //     isBanned: false,
    //     banDate: null,
    //     banReason: null,
    //   },
    //   blogger: {},
    //   passwordRecovery: {},
    // });
  }
  async updateUserBanInfoByAdmin(userId: string, updateBanInfo: any) {
    return this.prisma.banInfo.update({
      where: { userId: userId },
      data: {
        isBanned: updateBanInfo.isBanned,
        banDate: updateBanInfo.banDate,
        banReason: updateBanInfo.banReason,
      },
    });
  }

  async findBannedUserByBlogger(
    userId: string,
    bloggerId: string,
    blogId: string,
  ) {
    return this.prisma.bannedUsers.findFirst({
      where: {
        userId,
        bloggerId,
        blogId,
      },
    });
  }
  async banUserByBlogger(
    bloggerId: string,
    user: User,
    banUserByBloggerDto: BanUserByBloggerDto,
  ) {
    return this.prisma.bannedUsers.create({
      data: {
        login: user.login,
        isBanned: banUserByBloggerDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: banUserByBloggerDto.banReason,
        blogId: banUserByBloggerDto.blogId,
        bloggerId: bloggerId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      },
    });
  }
  async unbanUserByBlogger(id: string) {
    return this.prisma.bannedUsers.delete({ where: { id } });
  }
  async getEmailConfirmationCode(userEmail: string) {
    return this.prisma.emailConfirmation.findUnique({
      where: { userEmail: userEmail },
    });
  }
  async updateEmailConfirmationCode(userEmail: string) {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: { isConfirmed: true },
    });
  }
  async updateEmailConfirmationInfo(userEmail: string) {
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
  async updatePasswordRecoveryInfo(userId: string) {
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
  async updateUserHash(id: string, hash: string) {
    return this.prisma.user.update({ where: { id }, data: { hash } });
  }
  async deleteUserById(id: string) {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
  async findUserByLogin(login: string) {
    return this.userRepo.findOne({ where: { login } });
  }
  async findUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
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
