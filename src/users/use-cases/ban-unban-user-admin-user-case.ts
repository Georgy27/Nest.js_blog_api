import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repositories/mongo/users.repository';
import { BanUserDto } from '../dto/ban.user.dto';
import { NotFoundException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../security-devices/security.devices.repository';
import { CommentsRepository } from '../../comments/comments.repository';
import { ReactionsRepository } from '../../reactions/reactions.repository';
import { UsersSQLRepository } from '../repositories/PostgreSQL/users.sql.repository';

export class BanOrUnbanUserByAdminCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}
@CommandHandler(BanOrUnbanUserByAdminCommand)
export class BanOrUnbanUserByAdminUseCase
  implements ICommandHandler<BanOrUnbanUserByAdminCommand>
{
  constructor(
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly reactionsRepository: ReactionsRepository,
  ) {}
  async execute(command: BanOrUnbanUserByAdminCommand): Promise<void> {
    // find user
    const user = await this.usersSQLRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('user with this Id does not exist');
    // ban-unban user
    const updateBanInfo = command.banUserDto.isBanned
      ? {
          isBanned: command.banUserDto.isBanned,
          banDate: new Date().toISOString(),
          banReason: command.banUserDto.banReason,
        }
      : {
          isBanned: command.banUserDto.isBanned,
          banDate: null,
          banReason: null,
        };

    await this.usersSQLRepository.updateUserBanInfoByAdmin(
      user.id,
      updateBanInfo,
    );

    // await this.commentsRepository.updateUserBanStatus(
    //   command.userId,
    //   command.banUserDto.isBanned,
    // );
    // await this.reactionsRepository.updateUserBanStatus(
    //   command.userId,
    //   command.banUserDto.isBanned,
    // );
    // // delete refresh tokens
    // if (command.banUserDto.isBanned) {
    //   await this.securityDevicesRepository.deleteAllUserSessions(
    //     command.userId,
    //   );
    // }
  }
}
