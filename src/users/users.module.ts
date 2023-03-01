import { forwardRef, Inject, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersSuperAdminController } from './api/super-admin/users-super-admin.controller';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';
import { UsersRepository } from './users.repository';
import { CreateUserByAdminUseCase } from './use-cases/create-user-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BanOrUnbanUserByAdminUseCase } from './use-cases/ban-unban-user-admin-user-case';
import { SecurityDevicesModule } from '../security-devices/security.devices.module';
import { CommentsModule } from '../comments/comments.module';
import { ReactionsModule } from '../reactions/reactions.module';

const useCases = [CreateUserByAdminUseCase, BanOrUnbanUserByAdminUseCase];
@Module({
  imports: [
    forwardRef(() => CommentsModule),
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SecurityDevicesModule,
    ReactionsModule,
  ],
  controllers: [UsersSuperAdminController],
  providers: [UsersService, UsersQueryRepository, UsersRepository, ...useCases],
  exports: [UsersRepository, UsersService, UsersQueryRepository],
})
export class UsersModule {}
